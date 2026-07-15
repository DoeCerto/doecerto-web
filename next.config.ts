import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  allowedDevOrigins: ["192.168.1.18", "localhost"],
  reactCompiler: true,

  // 1. ATIVE ISSO (É obrigatório para o Capacitor ver o index.html)
  output: "export",

  // 2. REMOVA OU COMENTE O distDir
  // O Next já cria a pasta "out" por padrão quando o output é "export"
  // distDir: "out", 

  // 3. Adicione isso para garantir a estrutura de pastas que o Capacitor ama
  trailingSlash: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;