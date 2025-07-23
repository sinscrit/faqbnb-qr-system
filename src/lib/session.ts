/**
 * Session Management Utility for Anonymous User Tracking
 * 
 * Provides persistent session IDs for analytics and reaction tracking
 * without requiring user authentication. Session IDs are stored in
 * localStorage with automatic expiration after 24 hours.
 */

// Constants for session management
const SESSION_STORAGE_KEY = 'faqbnb_session';
const SESSION_EXPIRY_HOURS = 24;
const SESSION_EXPIRY_MS = SESSION_EXPIRY_HOURS * 60 * 60 * 1000; // 24 hours in milliseconds

// Interface for stored session data
interface SessionData {
  sessionId: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Generates a unique session ID using crypto.randomUUID() with fallback
 * @returns A unique session identifier string
 */
export function generateSessionId(): string {
  // Try to use crypto.randomUUID() first (available in modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (error) {
      console.warn('crypto.randomUUID() failed, falling back to manual generation:', error);
    }
  }
  
  // Fallback: Generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Checks if the current environment supports localStorage
 * @returns True if localStorage is available, false otherwise
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    
    // Test localStorage availability (might be disabled in private mode)
    const testKey = '__faqbnb_localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('localStorage is not available:', error);
    return false;
  }
}

/**
 * Stores session data in localStorage with expiration timestamp
 * @param sessionData The session data to store
 */
function storeSessionData(sessionData: SessionData): void {
  if (!isLocalStorageAvailable()) {
    console.warn('Cannot store session data: localStorage not available');
    return;
  }
  
  try {
    const serializedData = JSON.stringify(sessionData);
    window.localStorage.setItem(SESSION_STORAGE_KEY, serializedData);
  } catch (error) {
    console.error('Failed to store session data:', error);
  }
}

/**
 * Retrieves and validates session data from localStorage
 * @returns Valid session data or null if not found/expired/invalid
 */
function getStoredSessionData(): SessionData | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  
  try {
    const storedData = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedData) {
      return null;
    }
    
    const sessionData: SessionData = JSON.parse(storedData);
    
    // Validate session data structure
    if (!sessionData.sessionId || !sessionData.createdAt || !sessionData.expiresAt) {
      console.warn('Invalid session data structure, clearing session');
      clearStoredSession();
      return null;
    }
    
    // Check if session has expired
    const now = Date.now();
    if (now > sessionData.expiresAt) {
      console.info('Session expired, clearing stored session');
      clearStoredSession();
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error('Failed to parse stored session data:', error);
    clearStoredSession();
    return null;
  }
}

/**
 * Clears stored session data from localStorage
 */
function clearStoredSession(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stored session:', error);
  }
}

/**
 * Creates a new session with generated ID and expiration
 * @returns New session data object
 */
function createNewSession(): SessionData {
  const now = Date.now();
  const sessionData: SessionData = {
    sessionId: generateSessionId(),
    createdAt: now,
    expiresAt: now + SESSION_EXPIRY_MS,
  };
  
  console.info('Created new session:', {
    sessionId: sessionData.sessionId,
    expiresAt: new Date(sessionData.expiresAt).toISOString(),
  });
  
  storeSessionData(sessionData);
  return sessionData;
}

/**
 * Gets the current session ID, creating one if necessary
 * This is the main function to be used throughout the application
 * 
 * @returns Current session ID string
 */
export function getSessionId(): string {
  // First try to get existing valid session
  const existingSession = getStoredSessionData();
  if (existingSession) {
    return existingSession.sessionId;
  }
  
  // Create new session if none exists or expired
  const newSession = createNewSession();
  return newSession.sessionId;
}

/**
 * Gets full session information including timestamps
 * Useful for debugging and analytics
 * 
 * @returns Session data object or null if session cannot be created
 */
export function getSessionInfo(): SessionData | null {
  const existingSession = getStoredSessionData();
  if (existingSession) {
    return existingSession;
  }
  
  // Create new session if none exists
  return createNewSession();
}

/**
 * Manually refresh the current session (extend expiration)
 * This can be called on user interaction to keep session alive
 * 
 * @returns True if session was refreshed, false if failed
 */
export function refreshSession(): boolean {
  try {
    const currentSession = getStoredSessionData();
    if (currentSession) {
      // Extend current session
      const now = Date.now();
      const refreshedSession: SessionData = {
        ...currentSession,
        expiresAt: now + SESSION_EXPIRY_MS,
      };
      
      storeSessionData(refreshedSession);
      console.info('Session refreshed:', {
        sessionId: refreshedSession.sessionId,
        newExpiresAt: new Date(refreshedSession.expiresAt).toISOString(),
      });
      return true;
    } else {
      // Create new session if none exists
      createNewSession();
      return true;
    }
  } catch (error) {
    console.error('Failed to refresh session:', error);
    return false;
  }
}

/**
 * Manually clear the current session
 * Useful for debugging or implementing "reset" functionality
 */
export function clearSession(): void {
  console.info('Manually clearing session');
  clearStoredSession();
}

/**
 * Check if a session exists and is valid
 * @returns True if valid session exists, false otherwise
 */
export function hasValidSession(): boolean {
  return getStoredSessionData() !== null;
}

/**
 * Get session statistics for debugging
 * @returns Object with session statistics or null if no session
 */
export function getSessionStats(): {
  sessionId: string;
  age: number; // Age in milliseconds
  timeUntilExpiry: number; // Time until expiry in milliseconds
  isExpired: boolean;
} | null {
  const sessionData = getStoredSessionData();
  if (!sessionData) {
    return null;
  }
  
  const now = Date.now();
  return {
    sessionId: sessionData.sessionId,
    age: now - sessionData.createdAt,
    timeUntilExpiry: sessionData.expiresAt - now,
    isExpired: now > sessionData.expiresAt,
  };
}

// Development/debugging helpers
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Make session utilities available in browser console for debugging
  (window as any).faqbnbSession = {
    getSessionId,
    getSessionInfo,
    refreshSession,
    clearSession,
    hasValidSession,
    getSessionStats,
    generateSessionId,
  };
} 