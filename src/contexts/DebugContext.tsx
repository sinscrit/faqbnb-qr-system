'use client';

/**
 * DebugContext
 *
 * Provides debug mode state across the application.
 * Debug mode can be enabled via:
 * - URL parameter: ?debug=true
 * - localStorage: debugMode=true
 * - Keyboard shortcut: Ctrl+Shift+D (toggles)
 *
 * When enabled, displays IDs for Items, Guides, and Properties.
 *
 * @module contexts/DebugContext
 * @lastModified 2026-02-13
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface DebugContextType {
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  setDebugMode: (enabled: boolean) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

const DEBUG_STORAGE_KEY = 'faqbnb_debug_mode';

export function DebugProvider({ children }: { children: ReactNode }) {
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Initialize debug mode from URL param or localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');

    if (debugParam === 'true') {
      setIsDebugMode(true);
      localStorage.setItem(DEBUG_STORAGE_KEY, 'true');
      return;
    }

    if (debugParam === 'false') {
      setIsDebugMode(false);
      localStorage.removeItem(DEBUG_STORAGE_KEY);
      return;
    }

    // Fall back to localStorage
    const stored = localStorage.getItem(DEBUG_STORAGE_KEY);
    if (stored === 'true') {
      setIsDebugMode(true);
    }
  }, []);

  // Keyboard shortcut: Ctrl+Shift+D to toggle
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsDebugMode(prev => {
          const newValue = !prev;
          if (newValue) {
            localStorage.setItem(DEBUG_STORAGE_KEY, 'true');
          } else {
            localStorage.removeItem(DEBUG_STORAGE_KEY);
          }
          return newValue;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDebugMode = useCallback(() => {
    setIsDebugMode(prev => {
      const newValue = !prev;
      if (newValue) {
        localStorage.setItem(DEBUG_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(DEBUG_STORAGE_KEY);
      }
      return newValue;
    });
  }, []);

  const setDebugModeValue = useCallback((enabled: boolean) => {
    setIsDebugMode(enabled);
    if (enabled) {
      localStorage.setItem(DEBUG_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(DEBUG_STORAGE_KEY);
    }
  }, []);

  return (
    <DebugContext.Provider value={{
      isDebugMode,
      toggleDebugMode,
      setDebugMode: setDebugModeValue
    }}>
      {children}
      {/* Debug mode indicator */}
      {isDebugMode && (
        <div className="fixed bottom-4 left-4 z-[9999] bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-900 rounded-full animate-pulse" />
          DEBUG MODE
          <button
            onClick={toggleDebugMode}
            className="ml-1 hover:bg-yellow-500 rounded px-1"
            title="Click or press Ctrl+Shift+D to disable"
          >
            ✕
          </button>
        </div>
      )}
    </DebugContext.Provider>
  );
}

export function useDebug(): DebugContextType {
  const context = useContext(DebugContext);
  if (!context) {
    // Return safe defaults if used outside provider
    return {
      isDebugMode: false,
      toggleDebugMode: () => {},
      setDebugMode: () => {},
    };
  }
  return context;
}

export default DebugContext;
