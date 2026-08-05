import type { Metadata } from "next";
import { Darker_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext"; 

const darker = Darker_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DoeCerto",
  description: "App de Doação",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={darker.className} suppressHydrationWarning>
        {/* Removemos aquela div com overflow-x-hidden daqui! */}
        
        {/* ✅ 2. Envolvendo a aplicação inteira com o Contexto */}
        <AuthProvider>
          {children}
        </AuthProvider>

      </body>
    </html>
  );
}