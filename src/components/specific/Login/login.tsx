"use client";

import Link from "next/link";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  login,
  verify2FALogin,
  generate2FA,
  enable2FA,
  Generate2FAResponse,
} from "@/services/login.service";
import {
  Eye,
  EyeClosed,
  Lock,
  Mail,
  Compass,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Key,
  Copy,
  Check,
  Download,
  ArrowLeft,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import { SecureStorageService } from "@/services/secure-storage.service";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type AuthStep = "credentials" | "2fa_verify" | "2fa_setup" | "2fa_backup_codes";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const { refreshSession, isAuthenticated, isLoading, userRole } = useAuth();

  // Estados do formulário de credenciais
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Estados do fluxo de 2FA
  const [step, setStep] = useState<AuthStep>("credentials");
  const [tempToken, setTempToken] = useState<string>("");
  const [pendingUser, setPendingUser] = useState<{ email?: string; role?: string } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [setupData, setSetupData] = useState<Generate2FAResponse | null>(null);
  const [isLoadingSetup, setIsLoadingSetup] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);
  const [isSubmitting2FA, setIsSubmitting2FA] = useState(false);
  const [error2FA, setError2FA] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [confirmedSavedCodes, setConfirmedSavedCodes] = useState(false);
  const [showManualKey, setShowManualKey] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  // Refs para o GSAP
  const mainWrapperRef = useRef(null);
  const imageRef = useRef(null);

  // Verifica se já está logado usando o AuthContext (Padrão Ouro /me)
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isPending && step === "credentials") {
      const roleLower = userRole?.toLowerCase() || "";
      let redirect = "/home";
      
      const fromUrl = searchParams?.get("from");
      if (fromUrl) {
        redirect = fromUrl;
      } else if (roleLower === "admin") {
        redirect = "/adm-dashboard";
      } else if (roleLower === "ong") {
        redirect = "/ong-dashboard";
      }

      router.replace(redirect);
    }
  }, [isLoading, isAuthenticated, userRole, isPending, step, router, searchParams]);

  // Inicializa o GSAP para animar os itens da tela
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(".animate-item",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 }
    ).fromTo(imageRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.2, ease: "power2.out" },
      "-=0.6"
    );
  }, { scope: mainWrapperRef, dependencies: [step] });

  // Função auxiliar para salvar a sessão e redirecionar
  const saveSessionAndRedirect = async (data: any, accountEmail?: string) => {
    const token = data?.accessToken || data?.access_token || data?.token;
    if (token) {
      try {
        await SecureStorageService.setAccessToken(token);
      } catch (capacitorError) { }
    }

    const targetEmail = accountEmail || data?.user?.email || data?.email || email;
    if (data?.trustedDeviceToken) {
      try {
        await SecureStorageService.setTrustedDeviceToken(data.trustedDeviceToken, targetEmail);
      } catch { }
    }

    localStorage.setItem("registration_completed", "true");
    
    const apiUserRole = data?.user?.role || data?.role;
    if (apiUserRole) {
      try {
        await SecureStorageService.setUserRole(apiUserRole);
      } catch { }
    }
    const userAvatar = data?.user?.avatarUrl || data?.avatarUrl;
    const userName = data?.user?.name || data?.name;

    if (userAvatar) {
      localStorage.setItem("userAvatar", userAvatar);
      document.cookie = `user_avatar=${encodeURIComponent(userAvatar)}; path=/; max-age=604800; SameSite=Lax`;
    }
    if (userName) {
      localStorage.setItem("userName", userName);
      document.cookie = `user_name=${encodeURIComponent(userName)}; path=/; max-age=604800; SameSite=Lax`;
    }

    toast.success("Autenticado com sucesso!");

    let finalRole = apiUserRole;
    if (!finalRole && token && token.includes(".")) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        finalRole = payload?.role;
      } catch (e) { }
    }

    await refreshSession();

    const fromUrl = searchParams?.get("from");
    const roleLower = finalRole?.toLowerCase() || "";
    let redirectPath = "/home";

    if (fromUrl) {
      redirectPath = fromUrl;
    } else {
      if (roleLower === "admin") redirectPath = "/adm-dashboard";
      else if (roleLower === "ong") redirectPath = "/ong-dashboard";
    }

    setTimeout(() => {
      router.replace(redirectPath);
    }, 1200);
  };

  function translateAuthError(err: any): string {
    let msg = err?.response?.data?.message || err?.message || "E-mail ou senha incorretos";
    if (Array.isArray(msg)) {
      msg = msg[0] || "E-mail ou senha incorretos";
    }
    if (typeof msg !== "string") return "E-mail ou senha incorretos";

    const lower = msg.toLowerCase();

    if (err?.status === 429 || err?.statusCode === 429 || lower.includes("bloqueada") || lower.includes("too many requests")) {
      return msg.includes("bloqueada") ? msg : "Muitas tentativas incorretas. Conta bloqueada temporariamente para sua segurança. Tente novamente em alguns minutos.";
    }

    if (lower.includes("password must be at least") || lower.includes("at least 8 characters")) {
      return "A senha deve ter pelo menos 8 caracteres.";
    }
    if (lower.includes("password should not be empty") || lower.includes("password is required")) {
      return "A senha é obrigatória.";
    }
    if (lower.includes("invalid email") || lower.includes("email must be valid")) {
      return "Endereço de e-mail inválido.";
    }
    if (lower.includes("email should not be empty") || lower.includes("email is required")) {
      return "O e-mail é obrigatório.";
    }
    if (
      lower.includes("invalid credentials") ||
      lower.includes("unauthorized") ||
      lower.includes("credentials") ||
      lower.includes("access denied")
    ) {
      return "E-mail ou senha incorretos. Verifique suas informações e tente novamente.";
    }
    if (lower.includes("user not found")) {
      return "Usuário não encontrado. Verifique seu e-mail.";
    }
    return msg;
  }

  // Carrega QR Code para configuração de 2FA
  async function load2FASetup(token: string) {
    setIsLoadingSetup(true);
    setError2FA(null);
    try {
      const res = await generate2FA(token);
      const data = (res?.data || res) as Generate2FAResponse;
      setSetupData(data);
    } catch (err: any) {
      setError2FA("Não foi possível gerar a chave de 2FA. Tente novamente.");
    } finally {
      setIsLoadingSetup(false);
    }
  }

  // 1. Fluxo de Login Inicial (Credenciais)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setPasswordError(null);

    if (!email) {
      setLoginError("Informe seu endereço de e-mail.");
      return;
    }
    if (!password) {
      setPasswordError("Informe sua senha.");
      return;
    }
    if (password.length < 8) {
      setPasswordError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setIsPending(true);
    try {
      const response = await login({ email, password });
      if (!response) throw new Error("Sem resposta do servidor");

      const data = (response?.data || response) as any;

      // Caso 1: Usuário precisa configurar 2FA obrigatório (Admin / ONG no primeiro acesso)
      if (data?.requires2FASetup && data?.tempToken) {
        setTempToken(data.tempToken);
        setPendingUser({ email: data.email || email, role: data.role });
        setTotpCode("");
        setError2FA(null);
        setStep("2fa_setup");
        setIsPending(false);
        await load2FASetup(data.tempToken);
        return;
      }

      // Caso 2: Usuário já possui 2FA ativo -> Desafio de TOTP
      if (data?.requires2FA && data?.tempToken) {
        setTempToken(data.tempToken);
        setPendingUser({ email: data.email || email, role: data.role });
        setTotpCode("");
        setError2FA(null);
        setUseBackupCode(false);
        setStep("2fa_verify");
        setIsPending(false);
        return;
      }

      // Caso 3: Login direto (Doador sem 2FA ou legacy)
      await saveSessionAndRedirect(data, email);
    } catch (err: any) {
      const friendlyMsg = translateAuthError(err);
      if (friendlyMsg.toLowerCase().includes("pelo menos 8 caracteres")) {
        setPasswordError(friendlyMsg);
      } else {
        setLoginError(friendlyMsg);
      }
      setIsPending(false);
    }
  }

  // 2. Validação do 2FA no login (TOTP ou Backup Code)
  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    setError2FA(null);

    const cleanCode = totpCode.trim();
    if (!cleanCode) {
      setError2FA(useBackupCode ? "Informe seu código de recuperação." : "Digite o código de 6 dígitos.");
      return;
    }

    setIsSubmitting2FA(true);
    try {
      const targetEmail = pendingUser?.email || email;
      const res = await verify2FALogin(tempToken, cleanCode, rememberDevice, targetEmail);
      const data = (res?.data || res) as any;
      await saveSessionAndRedirect(data, targetEmail);
    } catch (err: any) {
      const msg = err?.data?.message || err?.response?.data?.message || err?.message || "Código inválido ou expirado.";
      setError2FA(typeof msg === "string" ? msg : "Código incorreto. Tente novamente.");
      setIsSubmitting2FA(false);
    }
  }

  // 3. Ativação inicial de 2FA
  async function handleEnable2FA(e: React.FormEvent) {
    e.preventDefault();
    setError2FA(null);

    if (!setupData?.secret) {
      setError2FA("A chave de autenticação não foi carregada. Recarregue a página.");
      return;
    }

    const cleanCode = totpCode.trim().replace(/\s|-/g, "");
    if (cleanCode.length !== 6) {
      setError2FA("Digite o código de 6 dígitos gerado pelo seu app autenticador.");
      return;
    }

    setIsSubmitting2FA(true);
    try {
      const targetEmail = pendingUser?.email || email;
      const res = await enable2FA(tempToken, setupData.secret, cleanCode, rememberDevice, targetEmail);
      const data = (res?.data || res) as any;
      setBackupCodes(data.backupCodes || []);
      setSavedSessionData(data);
      setStep("2fa_backup_codes");
      toast.success("Autenticação em 2 etapas ativada com sucesso!");
    } catch (err: any) {
      const msg = err?.data?.message || err?.response?.data?.message || err?.message || "Código incorreto. Verifique o horário do seu celular.";
      setError2FA(typeof msg === "string" ? msg : "Código incorreto. Tente novamente.");
    } finally {
      setIsSubmitting2FA(false);
    }
  }

  // Copia chave secreta para a área de transferência
  const handleCopySecret = async () => {
    if (!setupData?.secret) return;
    try {
      await navigator.clipboard.writeText(setupData.secret);
      setCopiedSecret(true);
      toast.success("Chave copiada!");
      setTimeout(() => setCopiedSecret(false), 2500);
    } catch (err) {
      toast.error("Não foi possível copiar.");
    }
  };

  // Copia todos os códigos de backup
  const handleCopyAllCodes = async () => {
    if (!backupCodes.length) return;
    try {
      const formatted = `DOECERTO - CÓDIGOS DE RECUPERAÇÃO 2FA\nGerados em: ${new Date().toLocaleString()}\nConta: ${pendingUser?.email || email}\n\n` +
        backupCodes.map((c, i) => `${i + 1}. ${c}`).join("\n") +
        "\n\nATENÇÃO: Cada código só pode ser usado uma única vez. Guarde em local seguro.";
      await navigator.clipboard.writeText(formatted);
      setCopiedCodes(true);
      toast.success("Todos os códigos foram copiados!");
      setTimeout(() => setCopiedCodes(false), 2500);
    } catch (err) {
      toast.error("Erro ao copiar códigos.");
    }
  };

  // Baixa os códigos de backup como .txt
  const handleDownloadCodes = () => {
    if (!backupCodes.length) return;
    const formatted = `DOECERTO - CÓDIGOS DE RECUPERAÇÃO 2FA\nGerados em: ${new Date().toLocaleString()}\nConta: ${pendingUser?.email || email}\n\n` +
      backupCodes.map((c, i) => `${i + 1}. ${c}`).join("\n") +
      "\n\nATENÇÃO: Cada código só pode ser usado uma única vez. Guarde em local seguro.";

    const blob = new Blob([formatted], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `doecerto-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Arquivo baixado com sucesso!");
  };

  return (
    <div
      ref={mainWrapperRef}
      className="flex h-screen max-h-screen w-full font-sans selection:bg-[#6B39A7] selection:text-white bg-[#F9FAFB] lg:bg-white overflow-hidden"
    >
      <Toaster position="top-center" />

      {/* LADO ESQUERDO: CONTEÚDO PRINCIPAL / STEPS */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto flex flex-col relative items-center justify-start px-6 sm:px-10 lg:px-12 py-4 sm:py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div
          className={`w-full shrink-0 transition-all duration-300 ${
            step === "credentials"
              ? "max-w-[480px] my-auto"
              : "max-w-[560px] py-1"
          }`}
        >

          {/* ============================================================ */}
          {/* STEP 1: CREDENCIAIS NORMAIS                                 */}
          {/* ============================================================ */}
          {step === "credentials" && (
            <>
              <div className="animate-item opacity-0 mb-10 text-left">
                <h1 className="text-4xl sm:text-[3rem] font-bold text-gray-900 mb-2 tracking-tight leading-tight">
                  Bem-vindo de volta!
                </h1>
                <p className="text-gray-500 text-lg font-medium">
                  Insira suas credenciais para acessar a conta.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="animate-item opacity-0 flex flex-col gap-6">
                {loginError && (
                  <div className="flex items-center gap-3 p-4 bg-red-50/90 border border-red-200/90 rounded-2xl text-red-700 text-sm font-semibold animate-in fade-in slide-in-from-top-1 duration-300">
                    <AlertCircle size={20} className="shrink-0 text-red-500" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-gray-800 text-base font-bold tracking-wide">
                    Endereço de Email
                  </label>
                  <div className="relative group">
                    <Mail
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loginError ? "text-red-500" : "text-gray-400 group-focus-within:text-[#6B39A7]"}`}
                      size={22}
                    />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      className={`w-full bg-white border text-gray-900 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-lg font-medium shadow-sm ${loginError ? "border-red-400 focus:border-red-500 ring-red-100 ring-2" : "border-gray-200 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7]"}`}
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
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loginError || passwordError ? "text-red-500" : "text-gray-400 group-focus-within:text-[#6B39A7]"}`}
                      size={22}
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (loginError) setLoginError(null);
                        if (passwordError) setPasswordError(null);
                      }}
                      className={`w-full bg-white border text-gray-900 rounded-xl pl-12 pr-12 py-4 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-lg font-medium shadow-sm ${loginError || passwordError ? "border-red-400 focus:border-red-500 ring-red-100 ring-2" : "border-gray-200 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7]"}`}
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
                  {passwordError && (
                    <span className="text-red-500 text-sm font-bold mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {passwordError}
                    </span>
                  )}
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

              <div className="animate-item opacity-0 relative flex items-center justify-center mt-8 mb-6">
                <div className="absolute border-t border-gray-200 w-full"></div>
                <span className="bg-[#F9FAFB] lg:bg-white px-4 text-sm text-gray-500 font-medium relative">
                  Ou prefere dar uma olhadinha antes?
                </span>
              </div>

              <button
                type="button"
                onClick={() => router.push('/home')}
                disabled={isPending}
                className="animate-item opacity-0 w-full flex justify-center items-center gap-3 h-[60px] bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-lg rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-70"
              >
                <Compass className="w-6 h-6 text-[#6B39A7]" />
                Conhecer ONGs e causas
              </button>

              <div className="animate-item opacity-0 text-center mt-6 text-sm text-gray-500 px-4">
                Ao continuar, você concorda com nossos{" "}
                <Link
                  href="/privacy"
                  className="font-bold text-[#6B39A7] hover:underline transition-all"
                >
                  Termos e Política de Privacidade
                </Link>
                .
              </div>

              <div className="animate-item opacity-0 text-center mt-6">
                <span className="text-lg text-gray-500 font-medium">Não tem uma conta? </span>
                <Link
                  href="/register"
                  className="text-lg font-bold text-[#6B39A7] hover:text-purple-800 transition-colors"
                >
                  Criar conta
                </Link>
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* STEP 2: VERIFICAÇÃO DE 2FA (LOGIN DE QUEM JÁ TEM ATIVO)      */}
          {/* ============================================================ */}
          {step === "2fa_verify" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setError2FA(null);
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors w-fit -ml-1 cursor-pointer"
              >
                <ArrowLeft size={18} />
                Voltar ao login
              </button>

              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200/80 rounded-full text-xs font-bold uppercase tracking-wider text-purple-700 mb-4">
                  <ShieldCheck size={16} className="text-purple-600" />
                  Verificação em Duas Etapas
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                  Código de Autenticação
                </h1>
                <p className="text-gray-500 text-base font-medium">
                  {useBackupCode
                    ? "Digite um dos seus códigos de recuperação de 8 dígitos."
                    : `Abra seu aplicativo autenticador e insira o código de 6 dígitos gerado para ${pendingUser?.email || email}.`}
                </p>
              </div>

              <form onSubmit={handleVerify2FA} className="flex flex-col gap-6">
                {error2FA && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold animate-in fade-in">
                    <AlertCircle size={20} className="shrink-0 text-red-500" />
                    <span>{error2FA}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="totpCode" className="text-gray-800 text-sm font-bold tracking-wide">
                    {useBackupCode ? "Código de Recuperação (Backup Code)" : "Código TOTP (6 dígitos)"}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {useBackupCode ? <Key size={22} /> : <Smartphone size={22} />}
                    </div>
                    <input
                      id="totpCode"
                      type="text"
                      autoFocus
                      required
                      autoComplete="one-time-code"
                      placeholder={useBackupCode ? "EX: A1B2-C3D4" : "000 000"}
                      maxLength={useBackupCode ? 12 : 8}
                      value={totpCode}
                      onChange={(e) => {
                        const val = useBackupCode ? e.target.value.toUpperCase() : e.target.value;
                        setTotpCode(val);
                        if (error2FA) setError2FA(null);
                      }}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7] transition-all text-xl font-mono font-bold tracking-widest text-center shadow-sm"
                    />
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {useBackupCode
                      ? "Cada código de recuperação só pode ser usado uma única vez."
                      : "O código expira a cada 30 segundos no seu aplicativo autenticador."}
                  </span>
                </div>

                {/* Checkbox Dispositivo Confiável (Padrão Fintech / 30 dias) */}
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-50/60 hover:bg-purple-50 border border-purple-100/90 hover:border-purple-200 cursor-pointer transition-all select-none text-left">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#6B39A7] focus:ring-[#6B39A7] border-gray-300 cursor-pointer accent-[#6B39A7]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#6B39A7] shrink-0" />
                      Lembrar deste dispositivo por 30 dias
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium mt-0.5 leading-snug">
                      Não solicitar código neste navegador nos próximos logins.
                    </span>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting2FA}
                  className="w-full flex justify-center items-center h-[56px] bg-purple-700 hover:bg-purple-800 text-white font-bold text-lg rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(74,38,117,0.5)] cursor-pointer"
                >
                  {isSubmitting2FA ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Confirmar e Acessar"
                  )}
                </button>

                <div className="border-t border-gray-200 pt-4 flex flex-col gap-3 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setUseBackupCode(!useBackupCode);
                      setTotpCode("");
                      setError2FA(null);
                    }}
                    className="text-sm font-semibold text-[#6B39A7] hover:underline cursor-pointer"
                  >
                    {useBackupCode
                      ? "Voltar para o código de 6 dígitos do aplicativo"
                      : "Perdeu o acesso ao app? Usar código de emergência"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: SETUP OBRIGATÓRIO DE 2FA (ADMIN / ONG)               */}
          {/* ============================================================ */}
          {step === "2fa_setup" && (
            <div className="flex flex-col gap-5 sm:gap-6 animate-in fade-in duration-300">
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setError2FA(null);
                }}
                className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-slate-500 hover:text-slate-900 transition-colors w-fit -ml-1 cursor-pointer outline-none focus:outline-none"
              >
                <ArrowLeft size={18} />
                Cancelar e voltar ao login
              </button>

              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-50 border border-purple-200/80 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-[#6B39A7] mb-2.5 shadow-2xs">
                  <ShieldCheck size={16} className="text-[#6B39A7]" />
                  Segurança Institucional Obrigatória
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">
                  Ativar Autenticador (2FA)
                </h1>
                <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
                  Contas de <strong>Administradores e ONGs</strong> gerenciam transações financeiras.
                  Configure seu aplicativo autenticador para proteger sua conta.
                </p>
              </div>

              {error2FA && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm sm:text-base font-semibold animate-in fade-in">
                  <AlertCircle size={20} className="shrink-0 text-red-500" />
                  <span>{error2FA}</span>
                </div>
              )}

              {/* Card de Configuração Fintech */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 sm:gap-5">
                {/* Passo 1: QR Code */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#6B39A7] text-white text-xs sm:text-sm font-black shadow-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Escaneie o QR Code com seu aplicativo
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                        Abra o Google Authenticator, Microsoft Authenticator ou 1Password.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 sm:p-5 bg-slate-50/80 rounded-xl border border-slate-100">
                    {isLoadingSetup || !setupData ? (
                      <div className="w-36 h-36 sm:w-40 sm:h-40 flex flex-col items-center justify-center gap-2 shrink-0">
                        <div className="w-8 h-8 border-3 border-purple-200 border-t-[#6B39A7] rounded-full animate-spin"></div>
                        <span className="text-xs sm:text-sm text-slate-400 font-medium">Carregando QR...</span>
                      </div>
                    ) : (
                      <div className="relative p-2.5 bg-white rounded-xl shadow-xs border border-slate-200 shrink-0">
                        <img
                          src={setupData.qrCodeDataUrl}
                          alt="QR Code de Configuração 2FA"
                          className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-2.5 text-center sm:text-left flex-1 min-w-0">
                      <span className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                        Aponte a câmera do seu aplicativo autenticador para o código ao lado.
                      </span>

                      {/* Toggle chave manual */}
                      {setupData?.secret && (
                        <div className="w-full">
                          <button
                            type="button"
                            onClick={() => setShowManualKey(!showManualKey)}
                            className="text-xs sm:text-sm font-bold text-[#6B39A7] hover:text-[#582d8c] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            {showManualKey ? "Ocultar chave manual" : "Não consegue escanear? Inserir chave"}
                          </button>

                          {showManualKey && (
                            <div className="mt-2.5 p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-left animate-in fade-in shadow-xs">
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Chave Manual</span>
                                <span className="font-mono text-sm sm:text-base font-bold text-slate-800 truncate select-all">{setupData.secret}</span>
                              </div>
                              <button
                                type="button"
                                onClick={handleCopySecret}
                                className="shrink-0 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 transition-colors font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                                title="Copiar chave"
                              >
                                {copiedSecret ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                <span>{copiedSecret ? "Copiado" : "Copiar"}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divisor */}
                <div className="border-t border-slate-100"></div>

                {/* Passo 2: Digitar código de confirmação */}
                <form onSubmit={handleEnable2FA} className="flex flex-col gap-3.5 sm:gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#6B39A7] text-white text-xs sm:text-sm font-black shadow-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Insira o código de 6 dígitos gerado
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                        Digite o código temporário exibido no seu aplicativo autenticador.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoComplete="one-time-code"
                      placeholder="000 000"
                      value={totpCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setTotpCode(val);
                        if (error2FA) setError2FA(null);
                      }}
                      className="w-full bg-slate-50/60 border-2 border-slate-200 text-slate-900 rounded-xl h-14 sm:h-15 px-4 focus:outline-none focus:ring-4 focus:ring-[#6B39A7]/10 focus:border-[#6B39A7] focus:bg-white transition-all text-2xl sm:text-3xl font-mono font-bold tracking-[0.45em] text-center shadow-xs"
                    />
                  </div>

                  {/* Checkbox Dispositivo Confiável */}
                  <label className="flex items-start gap-3.5 p-3 sm:p-3.5 rounded-xl bg-slate-50/80 hover:bg-purple-50/40 border border-slate-200 hover:border-purple-200/80 cursor-pointer transition-all select-none text-left">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-slate-300 text-[#6B39A7] focus:ring-[#6B39A7] cursor-pointer accent-[#6B39A7]"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck size={16} className="text-[#6B39A7] shrink-0" />
                        Lembrar deste dispositivo por 30 dias
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 leading-snug">
                        Permanecer conectado com segurança neste navegador sem exigir código a cada login.
                      </span>
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting2FA || totpCode.length !== 6}
                    className="w-full flex justify-center items-center h-[52px] sm:h-[56px] bg-[#6B39A7] hover:bg-[#582d8c] text-white font-bold text-base sm:text-lg rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-purple-900/15 cursor-pointer outline-none focus:outline-none"
                  >
                    {isSubmitting2FA ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Validar e Ativar 2FA"
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}


          {/* ============================================================ */}
          {/* STEP 4: SALVAR CÓDIGOS DE BACKUP (APÓS ATIVAÇÃO)             */}
          {/* ============================================================ */}
          {step === "2fa_backup_codes" && (
            <div className="flex flex-col gap-7 animate-in fade-in duration-300">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 mb-3.5 shadow-2xs">
                  <Check size={16} className="text-emerald-600" />
                  2FA Ativado com Sucesso
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2.5 tracking-tight">
                  Guarde seus Códigos
                </h1>
                <p className="text-slate-600 text-base sm:text-lg font-normal leading-relaxed">
                  Estes <strong>8 códigos de uso único</strong> são a sua garantia caso perca o celular.
                  Cada código só pode ser usado uma vez para recuperar o acesso.
                </p>
              </div>

              {/* Grid dos 8 Códigos */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-3">
                  {backupCodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-center font-mono font-bold text-base sm:text-lg text-slate-900 tracking-wider shadow-2xs select-all"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyAllCodes}
                    className="flex-1 flex items-center justify-center gap-2 h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    {copiedCodes ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    <span>Copiar Todos</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCodes}
                    className="flex-1 flex items-center justify-center gap-2 h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <Download size={18} />
                    <span>Baixar (.txt)</span>
                  </button>
                </div>
              </div>

              {/* Checkbox de Confirmação */}
              <div className="flex items-start gap-3.5 p-4 sm:p-5 bg-purple-50/70 border border-purple-200/80 rounded-2xl">
                <input
                  type="checkbox"
                  id="confirmBackup"
                  checked={confirmedSavedCodes}
                  onChange={(e) => setConfirmedSavedCodes(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-slate-300 text-[#6B39A7] focus:ring-[#6B39A7] cursor-pointer accent-[#6B39A7]"
                />
                <label
                  htmlFor="confirmBackup"
                  className="text-sm sm:text-base text-slate-700 font-medium cursor-pointer select-none leading-relaxed"
                >
                  Confirmo que copiei ou baixei meus 8 códigos de emergência e os guardei em um local seguro.
                </label>
              </div>

              {/* Botão de Avançar para o Dashboard */}
              <button
                type="button"
                disabled={!confirmedSavedCodes}
                onClick={() => saveSessionAndRedirect(savedSessionData, pendingUser?.email || email)}
                className="w-full flex justify-center items-center h-[56px] sm:h-[60px] bg-[#6B39A7] hover:bg-[#582d8c] text-white font-bold text-base sm:text-lg rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-900/15 cursor-pointer outline-none focus:outline-none"
              >
                Concluir e Acessar Dashboard
              </button>
            </div>
          )}

        </div>
      </div>

      {/* LADO DIREITO: IMAGEM HERO / BRANDING */}
      <div className="hidden lg:block w-1/2 relative h-screen bg-transparent">
        <div
          ref={imageRef}
          className="absolute inset-y-0 right-0 left-0 rounded-l-[2.5rem] overflow-hidden shadow-[-20px_0_40px_rgba(0,0,0,0.05)] opacity-0"
        >
          <img
            src="/fotocrianca1.png"
            alt="DoeCerto Segurança"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4A2675]/40 via-transparent to-transparent mix-blend-multiply"></div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] lg:bg-white">
        <div className="w-10 h-10 border-4 border-[#6B39A7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}