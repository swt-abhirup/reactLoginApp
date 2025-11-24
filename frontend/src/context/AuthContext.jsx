import React, { createContext, useContext, useEffect, useState } from "react";
import { setAuthToken } from "../api/axios";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // load from localStorage on init
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      setAuth(true);
      setAuthToken(t);
    }
  }, []);

  const login = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
    setAuth(true);
    setAuthToken(t);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuth(false);
    setAuthToken(null);
  };

  const value = { auth, token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
