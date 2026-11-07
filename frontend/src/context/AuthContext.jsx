import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getMe, login as loginRequest } from '../services/authService';
import { AUTH_UNAUTHORIZED_EVENT } from '../services/api';
import { clearAuth, getToken, getUser, setAuth } from '../utils/tokenStorage';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const login = useCallback(async (username, password) => {
    const response = await loginRequest(username, password);
    const nextUser = {
      userId: response.userId,
      username: response.username,
      role: response.role,
    };

    setAuth(response.token, nextUser);
    setUser(nextUser);

    return nextUser;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      if (!getToken()) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      const storedUser = getUser();
      if (storedUser && isMounted) {
        setUser(storedUser);
      }

      try {
        const currentUser = await getMe();
        if (!isMounted) {
          return;
        }

        const nextUser = {
          userId: currentUser.userId,
          username: currentUser.username,
          role: currentUser.role,
        };

        setAuth(getToken(), nextUser);
        setUser(nextUser);
      } catch {
        if (isMounted) {
          clearAuth();
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
