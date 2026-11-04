import { useState, useEffect } from 'react';

/**
 * Debounces any fast-changing value (e.g. search input)
 * @param {*} value - The input value to debounce
 * @param {number} delayMs - Delay in milliseconds (defaults to 300ms)
 * @returns {*} Debounced value
 */
export function useDebounce(value, delayMs = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

