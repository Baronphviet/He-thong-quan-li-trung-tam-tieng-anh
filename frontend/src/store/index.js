import { createContext, createElement, useContext, useMemo, useState } from "react";
import { AUTH_STORAGE_KEY, getStoredAuth } from "../services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getStoredAuth);

  const setUser = (nextUser) => {
    setUserState(nextUser);
    if (nextUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user?.token),
    role: user?.role || null,
    userId: user?.id ?? null,
    login: setUser,
    logout: () => setUser(null)
  }), [user]);

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
