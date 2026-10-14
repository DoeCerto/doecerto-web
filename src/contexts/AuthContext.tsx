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
        const avatar = user.avatarUrl || localStorage.getItem("userAvatar");
        setUserAvatar(avatar);
        if (user.avatarUrl) {
          localStorage.setItem("userAvatar", user.avatarUrl);
          document.cookie = `user_avatar=${encodeURIComponent(user.avatarUrl)}; path=/; max-age=604800; SameSite=Lax`;
        }
        if (user.name) {
          localStorage.setItem("userName", user.name);
          document.cookie = `user_name=${encodeURIComponent(user.name)}; path=/; max-age=604800; SameSite=Lax`;
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserName(null);
        setUserAvatar(null);
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
      document.cookie = "user_avatar=; path=/; max-age=0";
      document.cookie = "user_name=; path=/; max-age=0";
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