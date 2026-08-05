"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Definimos o formato dos dados que vão ficar globais
type AuthContextType = {
  isAuthenticated: boolean;
  userRole: string | null;
  userAvatar: string | null;
  userName: string | null;
  refreshSession: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Criamos o Provedor (A "bolha" que vai envolver o app)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Função que lê os dados do LocalStorage e atualiza o estado do React
const refreshSession = () => {
    // Como você optou por manter dados leves no localStorage para a interface:
    const hasUser = localStorage.getItem("userName") || localStorage.getItem("registration_completed");
    
    // Se houver usuário ou registro concluído, o usuário está autenticado visualmente
    setIsAuthenticated(!!hasUser);
    setUserRole(localStorage.getItem("userRole"));
    setUserAvatar(localStorage.getItem("userAvatar"));
    setUserName(localStorage.getItem("userName"));
  };

  // Quando o app abre, ele tenta ler a sessão que já existe
  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userAvatar, userName, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Hook customizado para facilitar o uso nos componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};