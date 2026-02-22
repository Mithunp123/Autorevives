import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for API data fetching with loading/error states.
 */
export function useApi(fetchFn, options = {}) {
  const { immediate = true, deps = [], initialData = null } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchFn(...args);
        if (mounted.current) {
          setData(response.data);
        }
        return response.data;
      } catch (err) {
        if (mounted.current) {
          setError(err.response?.data?.message || err.message || 'An error occurred');
        }
        throw err;
      } finally {
        if (mounted.current) {
          setLoading(false);
        }
      }
    },
    [fetchFn]
  );

  useEffect(() => {
    mounted.current = true;
    if (immediate) {
      execute();
    }
    return () => {
      mounted.current = false;
    };
  }, deps);

  const refetch = useCallback((...args) => execute(...args), [execute]);

  return { data, loading, error, refetch, setData };
}

/**
 * Debounce hook.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

/**
 * Window size hook for responsive logic.
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, []);

  return {
    ...size,
    isMobile: size.width < 768,
    isTablet: size.width >= 768 && size.width < 1024,
    isDesktop: size.width >= 1024,
  };
}

/**
 * Click outside hook for dropdowns/modals.
 */
export function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
