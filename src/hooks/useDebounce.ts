import { useState, useEffect } from "react";

/**
 * Delays updating the returned value until `delay` ms have elapsed
 * with no new changes. Useful for search inputs, username checks, etc.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
