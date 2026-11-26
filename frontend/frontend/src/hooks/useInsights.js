import { useEffect, useRef, useState } from 'react';
import { getInsights } from '../services/api.js';

export function useInsights(from, to) {
  const [state, setState] = useState({ generated: false, loading: false, data: null, error: null });
  const controllerRef = useRef(null);

  useEffect(() => {
    controllerRef.current?.abort();
    setState({ generated: false, loading: false, data: null, error: null });
  }, [from, to]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function generate() {
    if (!from || !to || state.loading) return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ generated: true, loading: true, data: null, error: null });
    try {
      const data = await getInsights({ from, to, lang: 'en' }, { signal: controller.signal });
      if (!controller.signal.aborted) setState({ generated: true, loading: false, data, error: null });
    } catch (error) {
      if (!controller.signal.aborted) setState({ generated: true, loading: false, data: null, error });
    }
  }

  return { ...state, generate };
}
