import type { Metadata } from "next"
import { Darker_Grotesque } from "next/font/google"
import "./globals.css"

const darker = Darker_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "DoeCerto",
  description: "App de Doação",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className={darker.className}>
        {children}
      </body>
    </html>
  )
}