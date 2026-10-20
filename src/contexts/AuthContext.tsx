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
  logout: (redirectTo?: string) => Promise<void>;
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

  const logout = useCallback(async (redirectTo: string = "/login") => {
    // 1. Limpeza síncrona imediata de tokens e dados de sessão
    try {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.remove({ key: "access_token" });
      await Preferences.remove({ key: "userRole" });
    } catch { }

    localStorage.removeItem("access_token");
    localStorage.removeItem("CapacitorStorage.access_token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("userName");
    localStorage.removeItem("registration_completed");
    localStorage.removeItem("hideDonationTutorial");
    sessionStorage.removeItem("dismiss_ong_setup_prompt");

    if (typeof document !== "undefined") {
      document.cookie = "user_avatar=; path=/; max-age=0";
      document.cookie = "user_name=; path=/; max-age=0";
    }

    // 2. Notifica o backend para invalidar refresh token e limpar cookies httpOnly
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
        keepalive: true,
      });
    } catch { }

    // 3. Padrão Ouro: Navegação imediata SEM esperar refreshSession()
    // Isso elimina o piscar/re-render deslogado da página atual
    if (typeof window !== "undefined") {
      window.location.replace(redirectTo);
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
    <AuthContext.Provider value={{ isAuthenticated, userRole, userAvatar, userName, isLoading, refreshSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};