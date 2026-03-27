import { useState, useEffect, useCallback } from 'react';

type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'error'; data: null; error: Error }
  | { status: 'ok'; data: T; error: null };

/**
 * Hook genérico para manejar llamadas asíncronas con estados loading/error/ok.
 * Previene actualizaciones de estado en componentes desmontados.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = []
): AsyncState<T> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'loading',
    data: null,
    error: null,
  });

  const load = useCallback(() => {
    let cancelled = false;
    setState({ status: 'loading', data: null, error: null });
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ status: 'ok', data, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', data: null, error });
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    return load();
  }, [load]);

  return { ...state, retry: load };
}
