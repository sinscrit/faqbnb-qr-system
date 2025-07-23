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
  const [optimisticCounts, setOptimisticCounts] = useState<ReactionCounts | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

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
    setNetworkError(null);
    setLoading(reactionType, true);

    // Optimistic UI update - calculate what the new counts should be
    const currentCounts = optimisticCounts || counts;
    const wasUserReactionSame = userReaction === reactionType;
    
    let optimisticUpdate: ReactionCounts;
    let newUserReaction: ReactionType | null;

    if (wasUserReactionSame) {
      // Removing current reaction
      optimisticUpdate = {
        ...currentCounts,
        [reactionType]: Math.max(0, currentCounts[reactionType] - 1),
        total: Math.max(0, currentCounts.total - 1)
      };
      newUserReaction = null;
    } else {
      // Adding new reaction (and possibly removing old one)
      optimisticUpdate = { ...currentCounts };
      
      // Remove old reaction if exists
      if (userReaction) {
        optimisticUpdate[userReaction] = Math.max(0, optimisticUpdate[userReaction] - 1);
        optimisticUpdate.total = Math.max(0, optimisticUpdate.total - 1);
      }
      
      // Add new reaction
      optimisticUpdate[reactionType] = optimisticUpdate[reactionType] + 1;
      optimisticUpdate.total = optimisticUpdate.total + 1;
      newUserReaction = reactionType;
    }

    // Apply optimistic update immediately for responsive UI
    setOptimisticCounts(optimisticUpdate);
    updateLocalReaction(newUserReaction);

    try {
      let response;

      if (wasUserReactionSame) {
        // Remove existing reaction
        response = await reactionsApi.removeReaction(itemId, reactionType, sessionId);
      } else {
        // Add new reaction (API will automatically remove old one if exists)
        response = await reactionsApi.submitReaction({
          itemId,
          reactionType,
          sessionId
        });
      }

      if (response.success && response.data) {
        // Update with server response (should match optimistic update)
        setCounts(response.data);
        setOptimisticCounts(null); // Clear optimistic state
        
        if (onReactionChange) {
          onReactionChange(response.data);
        }
        
        console.info('Reaction update confirmed by server:', response.data);
      } else {
        throw new Error(response.error || 'Failed to update reaction');
      }
    } catch (error) {
      console.error('Reaction update failed:', error);
      
      // Revert optimistic update on error
      setOptimisticCounts(null);
      
      // Restore previous user reaction state
      const reactionKey = `faqbnb_reaction_${itemId}_${sessionId}`;
      const storedReaction = localStorage.getItem(reactionKey);
      setUserReaction(storedReaction as ReactionType || null);
      
      // Set network error for user feedback
      if (error instanceof Error) {
        setNetworkError(error.message);
      } else {
        setNetworkError('Network error - please try again');
      }
      
      // Auto-clear network error after 5 seconds
      setTimeout(() => setNetworkError(null), 5000);
    } finally {
      setLoading(reactionType, false);
    }
  };

  return (
    <div className="reaction-buttons">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">How was this helpful?</h3>
        {((optimisticCounts || counts).total > 0) && (
          <span className="text-xs text-gray-500">
            {(optimisticCounts || counts).total} reaction{(optimisticCounts || counts).total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Error Message */}
      {(error || networkError) && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error || networkError}</p>
          {networkError && (
            <p className="text-xs text-red-500 mt-1">
              Your reaction will be retried. Check your connection.
            </p>
          )}
        </div>
      )}

      {/* Reaction Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {REACTION_BUTTONS.map((button) => {
          const isActive = userReaction === button.type;
          const isLoading = loadingStates[button.type];
          const displayCounts = optimisticCounts || counts; // Use optimistic counts for immediate feedback
          const count = displayCounts[button.type] || 0;

          return (
            <button
              key={button.type}
              onClick={() => handleReactionClick(button.type)}
              disabled={isLoading || !sessionId}
              className={`
                group relative flex flex-col items-center justify-center
                min-h-[44px] min-w-[44px] p-2 rounded-lg border-2 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                touch-manipulation select-none
                sm:min-h-[60px] sm:min-w-[60px] sm:p-3
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isActive 
                  ? 'bg-blue-100 text-blue-600 border-blue-300 shadow-md'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300 hover:scale-105 hover:shadow-md'
                }
                ${!sessionId ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={`${isActive ? 'Remove' : 'Add'} ${button.label} reaction`}
              aria-label={`React with ${button.label}, currently ${count} reactions`}
              role="button"
              tabIndex={0}
            >
              {/* Loading Spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* Reaction Icon */}
              <span className="text-lg sm:text-xl mb-1 group-hover:scale-110 transition-transform duration-200" 
                    style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", "EmojiSymbols"' }}>
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