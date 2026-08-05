"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // ✅ useSearchParams importado
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/services/login.service";
import { Eye, EyeClosed, Lock, Mail, Compass } from "lucide-react";
import { Preferences } from "@capacitor/preferences";
import gsap from "gsap";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ Inicializando o searchParams
  const { refreshSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Refs para o GSAP
  const mainWrapperRef = useRef(null);
  const imageRef = useRef(null);

  // 1. Verifica se já está logado
useEffect(() => {
    const checkAuth = async () => {
      const { value: token } = await Preferences.get({ key: "access_token" });
      const localToken = localStorage.getItem("access_token");
      if (token || localToken) {
        const role = localStorage.getItem("userRole") || "";
        const redirect = role.toLowerCase() === 'ong' ? '/ong-dashboard' : '/dashboard';
        router.replace(redirect);
      }
    };
    checkAuth();
  }, [router]);

  // 2. Inicializa o GSAP
  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(".animate-item",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }
      ).fromTo(imageRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: "power2.out" },
        "-=0.6"
      );
    }, mainWrapperRef);

    return () => ctx.revert();
  }, []);

  // 3. Função auxiliar para salvar a sessão
  const saveSessionAndRedirect = async (data: any) => {
    const token = data?.accessToken || data?.access_token || data?.token;
    const apiUserRole = data?.user?.role || data?.role;
    const userAvatar = data?.user?.avatarUrl || data?.avatarUrl;
    const userName = data?.user?.name || data?.name;

    if (!token) throw new Error("Token não recebido");

    try {
      await Preferences.set({ key: "access_token", value: token });
      if (apiUserRole) await Preferences.set({ key: "userRole", value: apiUserRole });
    } catch (capacitorError) { }

    localStorage.setItem("access_token", token);
    localStorage.setItem("registration_completed", "true");
    if (apiUserRole) localStorage.setItem("userRole", apiUserRole);
    if (userAvatar) localStorage.setItem("userAvatar", userAvatar);
    if (userName) localStorage.setItem("userName", userName);

    toast.success("Login realizado com sucesso!");

    let finalRole = apiUserRole;
    if (!finalRole && token.includes(".")) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        finalRole = payload?.role;
      } catch (e) { }
    }
refreshSession();
    // ✅ Lógica de redirecionamento atualizada
    const fromUrl = searchParams?.get("from");
    const roleLower = finalRole?.toLowerCase() || "";
    let redirectPath = "/home";

    if (fromUrl) {
      // Se veio de uma rota protegida (ex: /donation?ongId=...), volta pra ela
      redirectPath = fromUrl;
    } else {
      // Se não, usa o fallback padrão de acordo com a role
      if (roleLower === "admin") redirectPath = "/adm-dashboard";
      else if (roleLower === "ong") redirectPath = "/ong-dashboard";
    }

   setTimeout(() => {
      router.replace(redirectPath);
    }, 1500);
  };

  // 4. Fluxo de Login Normal
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return toast.error("Preencha todos os campos");

    setIsPending(true);
    try {
      const response = await login({ email, password });
      if (!response) throw new Error("Sem resposta do servidor");

      const data = (response?.data || response) as any;
      await saveSessionAndRedirect(data);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Email ou senha inválidos";
      toast.error(errorMessage);
      setIsPending(false);
    }
  }

  return (
    <div
      ref={mainWrapperRef}
      className="flex min-h-[100dvh] w-full font-sans selection:bg-[#6B39A7] selection:text-white bg-[#F9FAFB] lg:bg-white overflow-hidden"
    >
      <Toaster position="top-center" />

      {/* LADO ESQUERDO */}
      <div className="w-full lg:w-1/2 flex flex-col relative items-center justify-center px-6 sm:px-12 py-10 overflow-y-auto">
        <div className="w-full max-w-[460px] shrink-0">

          <div className="animate-item mb-10 text-left">
            <h1 className="text-4xl sm:text-[3rem] font-bold text-gray-900 mb-2 tracking-tight leading-tight">
              Bem-vindo de volta!
            </h1>
            <p className="text-gray-500 text-lg font-medium">
              Insira suas credenciais para acessar a conta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="animate-item flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-gray-800 text-base font-bold tracking-wide">
                Endereço de Email
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6B39A7] transition-colors"
                  size={22}
                />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7] transition-all placeholder:text-gray-400 text-lg font-medium shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-gray-800 text-base font-bold tracking-wide">
                  Senha
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-[#6B39A7] hover:text-purple-800 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6B39A7] transition-colors"
                  size={22}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl pl-12 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7] transition-all placeholder:text-gray-400 text-lg font-medium shadow-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6B39A7] w-6 h-6 flex items-center justify-center cursor-pointer"
                >
                  <div className={`absolute transition-all duration-300 ${showPassword ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}>
                    <Eye size={22} />
                  </div>
                  <div className={`absolute transition-all duration-300 ${showPassword ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}>
                    <EyeClosed size={22} />
                  </div>
                </button>

              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="remember"
                className="w-5 h-5 rounded border-gray-300 text-purple-700 focus:ring-purple-700/50 cursor-pointer accent-purple-700"
              />
              <label
                htmlFor="remember"
                className="text-base text-gray-500 font-medium cursor-pointer select-none"
              >
                Lembrar de mim por 30 dias
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center h-[60px] mt-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-lg rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(74,38,117,0.5)]"
            >
              {isPending ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* DIVISOR ATUALIZADO */}
          <div className="animate-item relative flex items-center justify-center mt-8 mb-6">
            <div className="absolute border-t border-gray-200 w-full"></div>
            <span className="bg-[#F9FAFB] lg:bg-white px-4 text-sm text-gray-500 font-medium relative">
              Ou prefere dar uma olhadinha antes?
            </span>
          </div>

          {/* NOVO BOTÃO DE EXPLORAR */}
          <button
            type="button"
            onClick={() => router.push('/home')}
            disabled={isPending}
            className="animate-item w-full flex justify-center items-center gap-3 h-[60px] bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-lg rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-70"
          >
            <Compass className="w-6 h-6 text-[#6B39A7]" />
            Conhecer ONGs e causas
          </button>

          <div className="animate-item text-center mt-6 text-sm text-gray-500 px-4">
            Ao continuar, você concorda com nossos{" "}
            <Link
              href="/privacy"
              className="font-bold text-[#6B39A7] hover:underline transition-all"
            >
              Termos e Política de Privacidade
            </Link>
            .
          </div>

          <div className="animate-item text-center mt-6">
            <span className="text-lg text-gray-500 font-medium">Não tem uma conta? </span>
            <Link
              href="/register"
              className="text-lg font-bold text-[#6B39A7] hover:text-purple-800 transition-colors"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>

      {/* LADO DIREITO */}
      <div className="hidden lg:block w-1/2 relative h-screen bg-transparent">
        <div
          ref={imageRef}
          className="absolute inset-y-0 right-0 left-0 rounded-l-[2.5rem] overflow-hidden shadow-[-20px_0_40px_rgba(0,0,0,0.05)]"
        >
          <img
            src="/fotocrianca1.png"
            alt="Fundo Login"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4A2675]/30 via-transparent to-transparent mix-blend-multiply"></div>
        </div>
      </div>
    </div>
  );
}