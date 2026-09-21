import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("ems_token"));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("ems_token");
    localStorage.removeItem("ems_user");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("ems_token");
      const savedUser = localStorage.getItem("ems_user");
      if (savedToken && savedUser) {
        api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        try {
          const res = await api.get("/auth/me");
          setUser(res.data.data);
          localStorage.setItem("ems_user", JSON.stringify(res.data.data));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [logout]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: newToken, ...userData } = res.data.data;
    localStorage.setItem("ems_token", newToken);
    localStorage.setItem("ems_user", JSON.stringify(userData));
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
