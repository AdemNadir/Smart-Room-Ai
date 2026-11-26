import { useCallback, useEffect, useRef, useState } from 'react';

export function useResource(load, dependencies) {
  const loadRef = useRef(load);
  loadRef.current = load;
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({
      status: previous.data ? 'refreshing' : 'loading',
      data: previous.data,
      error: null,
    }));

    loadRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ status: 'success', data, error: null });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setState({ status: 'error', data: null, error });
        }
      });

    return () => controller.abort();
  }, [...dependencies, nonce]);

  return { ...state, reload };
}
