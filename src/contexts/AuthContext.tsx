"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  userRole: string | null;
  userAvatar: string | null;
  userName: string | null;
  refreshSession: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const refreshSession = useCallback(() => {
    const hasToken = !!(localStorage.getItem("access_token") || localStorage.getItem("CapacitorStorage.access_token"));
    // Opcional: Se quiser que o front confie também na existência do cookie Web (para SSR):
    const hasCookie = typeof document !== 'undefined' && document.cookie.includes("access_token=");
    
    if (hasToken || hasCookie) {
      setIsAuthenticated(true);
      setUserRole(localStorage.getItem("userRole"));
      setUserAvatar(localStorage.getItem("userAvatar"));
      setUserName(localStorage.getItem("userName"));
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      setUserAvatar(null);
      setUserName(null);
    }
  }, []);

  useEffect(() => {
    refreshSession();

    // Escuta se o usuário deslogou em outra aba
    const handleStorageChange = () => refreshSession();
    window.addEventListener("storage", handleStorageChange);

    // Escuta o "grito" da API quando tomar 401
    const handleAuthExpired = () => refreshSession();
    window.addEventListener("auth_expired", handleAuthExpired);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth_expired", handleAuthExpired);
    };
  }, [refreshSession]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userAvatar, userName, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};