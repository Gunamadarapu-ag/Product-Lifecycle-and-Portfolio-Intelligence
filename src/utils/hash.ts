/**
 * Helper functions for safe localStorage & hash operations
 */

export const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`localStorage not accessible for key ${key}:`, e);
    return null;
  }
};

export const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage not accessible for saving key ${key}:`, e);
  }
};

export const getHashParam = (key: string): string | null => {
  try {
    const hash = window.location.hash || '#';
    const params = new URLSearchParams(hash.substring(1).replace(/\+/g, '%20'));
    return params.get(key);
  } catch (e) {
    return null;
  }
};

