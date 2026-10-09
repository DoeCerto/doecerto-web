"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe } from "@/services/login.service";

type AuthContextType = {
  isAuthenticated: boolean;
  userRole: string | null;
  userAvatar: string | null;
  userName: string | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      // O Padrão Ouro: pergunta ao backend quem está logado!
      const response = await getMe();
      if (response && response.data && response.data.user) {
        const user = response.data.user;
        setIsAuthenticated(true);
        setUserRole(user.role);
        setUserName(user.name || localStorage.getItem("userName"));
        setUserAvatar(localStorage.getItem("userAvatar")); // Mantém avatar estético
      } else {
        throw new Error("Não autenticado");
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUserRole(null);
      setUserName(null);
      setUserAvatar(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();

    const handleStorageChange = () => refreshSession();
    window.addEventListener("storage", handleStorageChange);

    const handleAuthExpired = () => {
      setIsAuthenticated(false);
      setUserRole(null);
      setUserName(null);
      setUserAvatar(null);
    };
    window.addEventListener("auth_expired", handleAuthExpired);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth_expired", handleAuthExpired);
    };
  }, [refreshSession]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userAvatar, userName, isLoading, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};