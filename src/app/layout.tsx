import type { Metadata } from "next";
import { Darker_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext"; 

import { headers } from "next/headers";

const darker = Darker_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "DoeCerto — Doações Transparentes e Seguras para ONGs Verificadas",
    template: "%s | DoeCerto",
  },
  description:
    "Conecte-se a instituições sociais auditadas e realize doações via Pix Dinâmico ou itens materiais com rastreabilidade e transparência.",
  openGraph: {
    title: "DoeCerto — Doações Transparentes e Seguras",
    description:
      "Plataforma de doações para ONGs verificadas com auditoria pública e repasse seguro.",
    locale: "pt_BR",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || undefined;

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