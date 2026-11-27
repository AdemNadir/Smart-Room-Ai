import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { login, logout, me, setUnauthorizedHandler } from '../services/api.js';
import { t, uiLanguage } from '../strings.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, pending: false, error: null });
  const restoring = useRef(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setState({
      status: 'anonymous',
      user: null,
      pending: false,
      error: restoring.current ? null : new Error(t(uiLanguage(), 'auth.sessionExpired')),
    }));
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    me({ signal: controller.signal })
      .then(({ user }) => {
        if (!controller.signal.aborted) {
          setState({ status: 'authenticated', user, pending: false, error: null });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: 'anonymous', user: null, pending: false, error: null });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) restoring.current = false;
      });
    return () => controller.abort();
  }, []);

  async function signIn(username, password) {
    setState((previous) => ({ ...previous, pending: true, error: null }));
    try {
      const response = await login({ username, password });
      setState({ status: 'authenticated', user: response.user, pending: false, error: null });
      return { ok: true };
    } catch (error) {
      setState((previous) => ({ ...previous, pending: false, error }));
      return { ok: false, error };
    }
  }

  async function signOut() {
    try {
      await logout();
    } catch {
      // The local session is cleared even if the server cannot be reached.
    }
    setState({ status: 'anonymous', user: null, pending: false, error: null });
  }

  const value = useMemo(
    () => ({
      user: state.user,
      status: state.status,
      pending: state.pending,
      error: state.error,
      signIn,
      signOut,
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
