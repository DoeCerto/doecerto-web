"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { login } from "@/services/login.service";
import { Eye, EyeOff } from "lucide-react";
import { Preferences } from "@capacitor/preferences";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsPending(true);

    try {
      const response = await login({ email, password });
      const data = response.data as any;
      const token = data?.accessToken || data?.access_token || data?.token;

      // 1. Captura o cargo e avatar vindos da API
      const apiUserRole = data?.user?.role || data?.role;
      const userAvatar = data?.user?.avatarUrl || data?.avatarUrl;

      if (token) {
        // Persistência Nativa para APK (Capacitor)
        await Preferences.set({ key: "access_token", value: token });
        if (apiUserRole)
          await Preferences.set({ key: "userRole", value: apiUserRole });

        // Persistência para Navegador
        localStorage.setItem("access_token", token);
        if (apiUserRole) localStorage.setItem("userRole", apiUserRole);
        if (userAvatar) localStorage.setItem("userAvatar", userAvatar);

        toast.success("Login realizado com sucesso!");

        // 2. Lógica de Redirecionamento Atualizada
        let finalRole = apiUserRole;

        if (!finalRole) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            finalRole = payload.role;
          } catch (e) {
            console.error("Erro ao decodificar token:", e);
          }
        }

        let redirectPath = "/home";
        const roleLower = finalRole?.toLowerCase();

        if (roleLower === "admin") {
          redirectPath = "/adm-dashboard";
        } else if (roleLower === "ong") {
          redirectPath = "/ong-dashboard";
        }

        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      } else {
        toast.error("Erro ao processar autenticação.");
        setIsPending(false);
      }
    } catch (err: any) {
      console.error("Erro no login:", err);
      toast.error("Email ou senha inválidos");
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6B39A7] text-white px-6">
      <Toaster position="top-center" />

      <div className="w-full max-w-xs flex flex-col items-center">
        <div className="mb-4">
          <Image
            src="/logo.svg"
            alt="DoeCerto"
            width={120}
            height={120}
            priority
          />
        </div>

        <h1 className="text-4xl -mt-2 font-bold mb-10 text-center">
          Faça seu login!
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          <div className="flex flex-col mb-4">
            <label htmlFor="email" className="text-lg font-bold">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white p-2 rounded-md text-black text-xl placeholder:text-lg focus:outline-none"
            />
          </div>

          <div className="flex flex-col mb-6">
            <label htmlFor="password" className="text-lg font-bold">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white p-2 pr-10 rounded-md text-black text-xl placeholder:text-lg focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#6B39A7] transition-colors"
              >
                {showPassword ? <Eye size={24} /> : <EyeOff size={24} />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <Link
                href="/forgot-password"
                className="text-base font-bold text-[#E0C4FF] hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-60 mx-auto flex justify-center items-center text-2xl bg-white text-[#6B39A7] font-bold py-2 rounded-md border-2 border-white transition-all duration-300 hover:shadow-xl hover:shadow-[#6B39A7]/40 hover:-translate-y-1 active:scale-95 mb-8 cursor-pointer"
          >
            {isPending ? (
              <div className="w-7 h-7 border-4 border-[#6B39A7]/30 border-t-[#6B39A7] rounded-full animate-spin"></div>
            ) : (
              "Entrar"
            )}
          </button>

          <div className="flex flex-wrap justify-center gap-x-1 text-center text-lg font-bold text-purple-100">
            <span className="text-white font-light">
              Ainda não possui conta?
            </span>
            <Link
              href="/register-choice"
              className="text-[#E0C4FF] font-black hover:underline"
            >
              Cadastre-se agora
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
