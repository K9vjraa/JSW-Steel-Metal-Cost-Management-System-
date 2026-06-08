import * as React from "react";

/**
 * Fuzzy search match scoring algorithm
 * Returns a score representing the match quality: higher is better.
 * 0 represents no match.
 */
export function fuzzyMatchScore(text: string, query: string): number {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return 1;
  if (normalizedText === normalizedQuery) return 100;
  if (normalizedText.startsWith(normalizedQuery)) return 80;
  if (normalizedText.includes(normalizedQuery)) return 50;

  // Sequential fuzzy matching: check if characters of query appear sequentially in text
  let queryIdx = 0;
  let score = 0;
  for (let i = 0; i < normalizedText.length; i++) {
    if (normalizedText[i] === normalizedQuery[queryIdx]) {
      queryIdx++;
      score += 10 - Math.min(i - queryIdx, 8); // reward closer matched sequences
      if (queryIdx === normalizedQuery.length) {
        return score;
      }
    }
  }

  return 0;
}

/**
 * Custom hook to debounce values with customizable delay
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const RECENT_SEARCHES_KEY = "mcms-recent-searches";

export function useSearchHistory(maxItems = 8) {
  const [history, setHistory] = React.useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveHistory = (newHistory: string[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to write to search history local storage", e);
    }
  };

  const addSearch = React.useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, maxItems);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to write search history item to local storage", e);
      }
      return updated;
    });
  }, [maxItems]);

  const removeSearch = React.useCallback((query: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item !== query);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to remove search history item from local storage", e);
      }
      return updated;
    });
  }, []);

  const clearHistory = React.useCallback(() => {
    saveHistory([]);
  }, []);

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory
  };
}
