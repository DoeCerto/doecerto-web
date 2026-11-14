"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useId, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  login,
  loginWithGoogle,
  persistClientSession,
  extractApiErrorMessage,
  verify2FALogin,
  generate2FA,
  enable2FA,
  Generate2FAResponse,
  type LoginResponse,
  type GoogleProfileSummary,
} from "@/services/login.service";
import GoogleAuthButton from "@/components/ui/GoogleAuthButton";
import GoogleDonorOnboardingCard from "@/components/shared/GoogleDonorOnboardingCard";
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
  ArrowRight,
  QrCode,
  ShieldAlert,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type AuthStep =
  | "credentials"
  | "google_onboarding"
  | "2fa_verify"
  | "2fa_setup"
  | "2fa_backup_codes";

function GoogleAuthenticatorIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        fill="#1A73E8"
        d="M440,255.99997v0.00006C440,273.12085,426.12085,287,409.00003,287H302l-46-93.01001l49.6507-85.9951c8.56021-14.82629,27.51834-19.9065,42.34518-11.34724l0.00586,0.0034c14.82776,8.55979,19.90875,27.51928,11.34857,42.34682L309.70001,225h99.30002C426.12085,225,440,238.87917,440,255.99997z"
      />
      <path
        fill="#EA4335"
        d="M348.00174,415.34897l-0.00586,0.00339c-14.82684,8.55927-33.78497,3.47903-42.34518-11.34723L256,318.01001l-49.65065,85.99509c-8.5602,14.82629-27.51834,19.90652-42.34517,11.34729l-0.00591-0.00342c-14.82777-8.55978-19.90875-27.51929-11.34859-42.34683L202.29999,287L256,285l53.70001,2l49.6503,86.00214C367.91049,387.82968,362.8295,406.78918,348.00174,415.34897z"
      />
      <path
        fill="#FBBC04"
        d="M256,193.98999L242,232l-39.70001-7l-49.6503-86.00212c-8.56017-14.82755-3.47919-33.78705,11.34859-42.34684l0.00591-0.00341c14.82683-8.55925,33.78497-3.47903,42.34517,11.34726L256,193.98999z"
      />
      <path
        fill="#34A853"
        d="M248,225l-36,62H102.99997C85.87916,287,72,273.12085,72,256.00003v-0.00006C72,238.87917,85.87916,225,102.99997,225H248z"
      />
      <polygon fill="#185DB7" points="309.70001,287 202.29999,287 256,193.98999" />
    </svg>
  );
}

function MicrosoftAuthenticatorIcon({ size = 36 }: { size?: number }) {
  const uid = useId();
  const bodyGradId = `${uid}-ms-body`;
  const clipId = `${uid}-ms-clip`;
  const headGradId = `${uid}-ms-head`;
  const torsoGradId = `${uid}-ms-torso`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient
          id={bodyGradId}
          x1="-262"
          y1="843.65"
          x2="-262"
          y2="856.5"
          gradientTransform="translate(271 -839)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#0078d4" />
          <stop offset="1" stopColor="#1a508b" />
        </linearGradient>
        <clipPath id={clipId}>
          <path
            d="M15.929,7.908a2.971,2.971,0,0,0-2.546-2.94c-.072-.018-.126-.018-.2-.036a31.217,31.217,0,0,0-8.373,0c-.072.018-.143.018-.2.036A2.957,2.957,0,0,0,2.07,7.908a10.336,10.336,0,0,0,5.038,9.054,3.564,3.564,0,0,0,3.765,0A10.208,10.208,0,0,0,15.929,7.908Z"
            fill="none"
          />
        </clipPath>
        <linearGradient
          id={headGradId}
          x1="-261.938"
          y1="844.8"
          x2="-261.938"
          y2="849.987"
          gradientTransform="translate(271 -839)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.297" stopColor="#40c4f5" />
          <stop offset="1" stopColor="#0095e6" />
        </linearGradient>
        <linearGradient
          id={torsoGradId}
          x1="-261.938"
          y1="849.895"
          x2="-261.938"
          y2="859.786"
          gradientTransform="translate(271 -839)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.193" stopColor="#40c4f5" />
          <stop offset="1" stopColor="#0095e6" />
        </linearGradient>
      </defs>
      <g>
        <path
          d="M4.806,5.025c.068-.018.119-.018.187-.035.391-.054.782-.107,1.173-.143A2.968,2.968,0,0,1,9.022,2.478a2.967,2.967,0,0,1,2.855,2.369c.391.036.782.089,1.173.143.068.017.136.017.187.035a3.909,3.909,0,0,1,.612.161,4.82,4.82,0,0,0-9.637,0A3.22,3.22,0,0,1,4.806,5.025Z"
          fill="#215694"
        />
        <path
          d="M15.929,7.908a2.971,2.971,0,0,0-2.546-2.94c-.072-.018-.126-.018-.2-.036a31.217,31.217,0,0,0-8.373,0c-.072.018-.143.018-.2.036A2.957,2.957,0,0,0,2.07,7.908a10.336,10.336,0,0,0,5.038,9.054,3.564,3.564,0,0,0,3.765,0A10.208,10.208,0,0,0,15.929,7.908Z"
          fill={`url(#${bodyGradId})`}
        />
        <g clipPath={`url(#${clipId})`}>
          <g>
            <g opacity="0.4">
              <ellipse cx="9.063" cy="7.999" rx="2.331" ry="2.211" fill="#004795" />
            </g>
            <g opacity="0.4">
              <ellipse cx="9.062" cy="15.696" rx="4.661" ry="4.554" fill="#004795" />
            </g>
            <circle cx="9.062" cy="8.415" r="2.331" fill={`url(#${headGradId})`} />
            <circle cx="9.062" cy="16.124" r="4.661" fill={`url(#${torsoGradId})`} />
          </g>
        </g>
      </g>
    </svg>
  );
}

const AUTH_TUTORIAL_STEPS = [
  {
    key: "download",
    title: "Baixe um aplicativo autenticador",
    description:
      "Instale gratuitamente o Google Authenticator ou o Microsoft Authenticator pela loja de aplicativos (Google Play ou App Store) do seu celular.",
  },
  {
    key: "scan",
    title: "Escaneie o QR Code da tela",
    description:
      'Abra o aplicativo no celular, toque no botão "+" (Adicionar conta), escolha "Ler código QR" e aponte a câmera para o QR Code exibido.',
  },
  {
    key: "code",
    title: "Digite o código de 6 dígitos",
    description:
      "O aplicativo gera um código temporário de 6 números a cada 30 segundos. Digite esses dígitos no campo da tela para ativar seu 2FA.",
  },
] as const;

function AuthenticatorTutorialModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleCloseModal = () => {
    setStepIndex(0);
    setIsTransitioning(false);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStepIndex(0);
        setIsTransitioning(false);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleStepChange = (newIndex: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStepIndex(newIndex);
      setIsTransitioning(false);
    }, 150);
  };

  if (!open) return null;

  const currentStep = AUTH_TUTORIAL_STEPS[stepIndex];

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleCloseModal}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl sm:rounded-[2rem] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.25)] relative flex flex-col max-h-[calc(100vh-2rem)] border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-6 sm:p-7 border-b border-gray-100 shrink-0 bg-gray-50/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-2 bg-purple-100 text-[#6B39A7] text-sm font-bold px-3.5 py-1 rounded-full">
                Guia rápido
              </span>

              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Como configurar o Autenticador (2FA)?
              </h2>

              <p className="text-base text-gray-600 mt-1.5 font-medium">
                Leva menos de 1 minuto no seu celular.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full cursor-pointer"
              aria-label="Fechar guia"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* CONTEÚDO DO PASSO */}
        <div className="overflow-y-auto flex-1 min-h-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            className={`px-6 sm:px-8 py-6 sm:py-8 flex flex-col items-center text-center min-h-[300px] sm:min-h-[340px] justify-center transition-opacity duration-200 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            {stepIndex === 0 && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left shadow-2xs">
                  <GoogleAuthenticatorIcon size={44} />
                  <div className="min-w-0">
                    <p className="text-base font-bold text-gray-900 leading-tight">
                      Google Authenticator
                    </p>
                    <p className="text-sm text-gray-600 font-medium mt-0.5">
                      Android e iOS
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left shadow-2xs">
                  <MicrosoftAuthenticatorIcon size={44} />
                  <div className="min-w-0">
                    <p className="text-base font-bold text-gray-900 leading-tight">
                      Microsoft Authenticator
                    </p>
                    <p className="text-sm text-gray-600 font-medium mt-0.5">
                      Android e iOS
                    </p>
                  </div>
                </div>
              </div>
            )}

            {stepIndex === 1 && (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-purple-50 flex items-center justify-center mb-6 shadow-sm shrink-0">
                <QrCode className="text-[#6B39A7] w-12 h-12 sm:w-14 sm:h-14" />
              </div>
            )}

            {stepIndex === 2 && (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-emerald-50 flex items-center justify-center mb-6 shadow-sm shrink-0">
                <Smartphone className="text-emerald-600 w-12 h-12 sm:w-14 sm:h-14" />
              </div>
            )}

            <span className="bg-purple-100 text-[#6B39A7] px-4 py-1.5 rounded-full text-sm font-bold">
              Passo {stepIndex + 1} de {AUTH_TUTORIAL_STEPS.length}
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-4 leading-tight tracking-tight">
              {currentStep.title}
            </h3>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mt-3 max-w-md font-medium">
              {currentStep.description}
            </p>

            <div className="flex items-center gap-2 mt-6 sm:mt-8">
              {AUTH_TUTORIAL_STEPS.map((s, index) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleStepChange(index)}
                  className={`transition-all duration-300 rounded-full h-2.5 cursor-pointer ${
                    index === stepIndex
                      ? "w-10 bg-[#6B39A7]"
                      : "w-2.5 bg-purple-200 hover:bg-purple-300"
                  }`}
                  aria-label={`Ir para o passo ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-100 p-5 sm:p-6 bg-gray-50/50 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleStepChange(stepIndex - 1)}
              disabled={stepIndex === 0}
              className={`flex items-center gap-2 font-bold text-base transition-colors cursor-pointer ${
                stepIndex === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-[#6B39A7] hover:text-purple-800"
              }`}
            >
              <ChevronLeft size={20} />
              Voltar
            </button>

            {stepIndex < AUTH_TUTORIAL_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => handleStepChange(stepIndex + 1)}
                className="bg-[#6B39A7] hover:bg-[#582d8c] text-white px-6 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 transition-all shadow-lg shadow-purple-200 cursor-pointer active:scale-[0.98]"
              >
                Próximo
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCloseModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 transition-all shadow-lg shadow-emerald-200 cursor-pointer active:scale-[0.98]"
              >
                <CheckCircle2 size={20} />
                Entendi, configurar agora
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [setupSubStep, setSetupSubStep] = useState<"qr" | "code">("qr");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [is2FATutorialOpen, setIs2FATutorialOpen] = useState(false);
  const isSplitLayout = step === "credentials";

  // Estados do onboarding via Google
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [googleOnboardingToken, setGoogleOnboardingToken] = useState<string>("");
  const [googleProfile, setGoogleProfile] = useState<GoogleProfileSummary | null>(null);

  // Refs para o GSAP e rolagem entre steps
  const mainWrapperRef = useRef(null);
  const imageRef = useRef(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [step, setupSubStep]);

  // WEB-02: Sanitiza destino de redirecionamento pós-login contra Open Redirect
  const getSafeRedirectUrl = (rawFrom: string | null | undefined, fallback: string): string => {
    if (!rawFrom) return fallback;
    const trimmed = rawFrom.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
      return trimmed;
    }
    return fallback;
  };

  // Verifica se já está logado usando o AuthContext (Padrão Ouro /me)
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isPending && !isGooglePending && step === "credentials") {
      const roleLower = userRole?.toLowerCase() || "";
      let defaultRedirect = "/home";
      if (roleLower === "admin") {
        defaultRedirect = "/adm-dashboard";
      } else if (roleLower === "ong") {
        defaultRedirect = "/ong-dashboard";
      }

      const redirect = getSafeRedirectUrl(searchParams?.get("from"), defaultRedirect);
      router.replace(redirect);
    }
  }, [isLoading, isAuthenticated, userRole, isPending, isGooglePending, step, router, searchParams]);

  // Inicializa o GSAP para animar os itens da tela
  useGSAP(() => {
    if (step !== "credentials") return;
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
    const finalRole = await persistClientSession(data, accountEmail || email);
    toast.success("Autenticado com sucesso!");

    await refreshSession();

    const roleLower = finalRole?.toLowerCase() || "";
    let defaultRedirect = "/home";
    if (roleLower === "admin") defaultRedirect = "/adm-dashboard";
    else if (roleLower === "ong") defaultRedirect = "/ong-dashboard";

    const redirectPath = getSafeRedirectUrl(searchParams?.get("from"), defaultRedirect);

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

  const handlePostAuthData = async (data: LoginResponse, fallbackEmail?: string) => {
    if (data?.requiresOnboarding && data?.onboardingToken && data?.googleProfile) {
      setGoogleOnboardingToken(data.onboardingToken);
      setGoogleProfile(data.googleProfile);
      setPendingUser({ email: data.googleProfile.email, role: "donor" });
      setStep("google_onboarding");
      setIsPending(false);
      setIsGooglePending(false);
      return;
    }

    // Caso 1: Usuário precisa configurar 2FA obrigatório (Admin / ONG no primeiro acesso)
    if (data?.requires2FASetup && data?.tempToken) {
      setTempToken(data.tempToken);
      setPendingUser({ email: data.email || fallbackEmail, role: data.role });
      setTotpCode("");
      setError2FA(null);
      setShowManualKey(false);
      setSetupSubStep("qr");
      setIs2FATutorialOpen(false);
      setStep("2fa_setup");
      setIsPending(false);
      setIsGooglePending(false);
      await load2FASetup(data.tempToken);
      return;
    }

    // Caso 2: Usuário já possui 2FA ativo -> Desafio de TOTP
    if (data?.requires2FA && data?.tempToken) {
      setTempToken(data.tempToken);
      setPendingUser({ email: data.email || fallbackEmail, role: data.role });
      setTotpCode("");
      setError2FA(null);
      setUseBackupCode(false);
      setStep("2fa_verify");
      setIsPending(false);
      setIsGooglePending(false);
      return;
    }

    // Caso 3: Login direto (Doador sem 2FA ou dispositivo confiável)
    await saveSessionAndRedirect(data, data?.user?.email || fallbackEmail);
  };

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

      await handlePostAuthData(response.data, email);
    } catch (err: unknown) {
      const friendlyMsg = translateAuthError(err);
      if (friendlyMsg.toLowerCase().includes("pelo menos 8 caracteres")) {
        setPasswordError(friendlyMsg);
      } else {
        setLoginError(friendlyMsg);
      }
      setIsPending(false);
    }
  }

  async function handleGoogleAuthSuccess(accessToken: string) {
    setLoginError(null);
    setPasswordError(null);
    setIsGooglePending(true);
    try {
      const response = await loginWithGoogle({ accessToken });
      await handlePostAuthData(response.data, response.data?.user?.email);
    } catch (err: unknown) {
      setLoginError(
        extractApiErrorMessage(err, "Não foi possível entrar com o Google."),
      );
      setIsGooglePending(false);
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
      className={`flex h-[100dvh] w-full font-sans selection:bg-[#6B39A7] selection:text-white overflow-hidden relative ${
        isSplitLayout ? "bg-[#F9FAFB] lg:bg-white" : "bg-[#F4F5F7]"
      }`}
    >
      <Toaster position="top-center" />
      <AuthenticatorTutorialModal
        open={is2FATutorialOpen}
        onClose={() => setIs2FATutorialOpen(false)}
      />

      {!isSplitLayout && (
        <div
          aria-hidden="true"
          className="fixed inset-0 overflow-hidden pointer-events-none select-none"
        >
          <div className="absolute -top-28 -left-24 w-[460px] h-[460px] rounded-[4.5rem] bg-[#EAECEF] rotate-12" />
          <div className="absolute -bottom-32 left-1/4 w-[520px] h-[520px] rounded-[5rem] bg-[#EAECEF]/80 -rotate-12" />
          <div className="absolute top-12 -right-28 w-[500px] h-[500px] rounded-[4.5rem] bg-[#EDE9F5]/80 rotate-[24deg]" />
        </div>
      )}

      {/* LADO ESQUERDO / CARD CENTRALIZADO NOS STEPS DE 2FA */}
      <div
        ref={scrollContainerRef}
        className={`relative z-10 h-full overflow-y-auto flex flex-col items-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isSplitLayout
            ? "w-full lg:w-1/2 px-6 sm:px-12 py-8 sm:py-10"
            : "w-full px-4 sm:px-6 py-8 sm:py-12"
        }`}
      >
        <div
          className={`w-full shrink-0 my-auto transition-all duration-300 ease-out ${
            isSplitLayout
              ? "max-w-[480px] rounded-[28px] border border-transparent shadow-none bg-transparent"
              : "max-w-[600px] bg-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.12)] border border-gray-100 p-7 sm:p-10"
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
                  disabled={isPending || isGooglePending}
                  className="w-full flex justify-center items-center h-[60px] mt-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-lg rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(74,38,117,0.5)] cursor-pointer"
                >
                  {isPending ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>

              <div className="animate-item opacity-0 my-6 border-t border-gray-200" />

              <div className="animate-item opacity-0">
                <GoogleAuthButton
                  onSuccess={handleGoogleAuthSuccess}
                  onError={(msg) => setLoginError(msg)}
                  disabled={isPending}
                  isLoading={isGooglePending}
                />
              </div>

              <div className="animate-item opacity-0 relative flex items-center justify-center mt-7 mb-5">
                <div className="absolute border-t border-gray-200 w-full"></div>
                <span className="bg-[#F9FAFB] lg:bg-white px-4 text-sm text-gray-500 font-medium relative">
                  Ou prefere dar uma olhadinha antes?
                </span>
              </div>

              <button
                type="button"
                onClick={() => router.push('/home')}
                disabled={isPending || isGooglePending}
                className="animate-item opacity-0 w-full flex justify-center items-center gap-3 h-[56px] bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-base sm:text-lg rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 cursor-pointer"
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
          {/* STEP 1B: ONBOARDING PROGRESSIVO COM GOOGLE (APENAS CPF)      */}
          {/* ============================================================ */}
          {step === "google_onboarding" && googleProfile && googleOnboardingToken && (
            <GoogleDonorOnboardingCard
              onboardingToken={googleOnboardingToken}
              googleProfile={googleProfile}
              onBack={() => {
                setStep("credentials");
                setGoogleOnboardingToken("");
                setGoogleProfile(null);
              }}
              onCompleted={async (data, accountEmail) => {
                await saveSessionAndRedirect(data, accountEmail);
              }}
            />
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
                className="inline-flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-600 hover:text-gray-900 transition-colors w-fit -ml-1 cursor-pointer"
              >
                <ArrowLeft size={20} />
                Voltar ao login
              </button>

              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-50 border border-purple-200/80 rounded-full text-sm sm:text-base font-bold text-[#6B39A7] mb-3.5">
                  <ShieldCheck size={18} className="text-[#6B39A7]" />
                  Verificação em duas etapas
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2.5 tracking-tight">
                  Código de Autenticação
                </h1>
                <p className="text-gray-600 text-base sm:text-lg font-medium leading-relaxed">
                  {useBackupCode
                    ? "Digite um dos seus códigos de recuperação de 8 dígitos."
                    : `Abra seu aplicativo autenticador e insira o código de 6 dígitos gerado para ${pendingUser?.email || email}.`}
                </p>
              </div>

              <form onSubmit={handleVerify2FA} className="flex flex-col gap-6">
                {error2FA && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm sm:text-base font-semibold animate-in fade-in">
                    <AlertCircle size={20} className="shrink-0 text-red-500" />
                    <span>{error2FA}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="totpCode" className="text-gray-800 text-base sm:text-lg font-bold tracking-wide">
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
                      className="w-full bg-white border-2 border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-[#6B39A7]/15 focus:border-[#6B39A7] transition-all text-2xl sm:text-3xl font-mono font-bold tracking-widest text-center shadow-sm"
                    />
                  </div>
                  <span className="text-sm sm:text-base text-gray-600 font-medium mt-1">
                    {useBackupCode
                      ? "Cada código de recuperação só pode ser usado uma única vez."
                      : "O código expira a cada 30 segundos no seu aplicativo autenticador."}
                  </span>
                </div>

                {/* Checkbox Dispositivo Confiável (Padrão Fintech / 30 dias) */}
                <label className="flex items-start gap-3.5 p-4 rounded-xl bg-purple-50/60 hover:bg-purple-50 border border-purple-100/90 hover:border-purple-200 cursor-pointer transition-all select-none text-left">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded text-[#6B39A7] focus:ring-[#6B39A7] border-gray-300 cursor-pointer accent-[#6B39A7]"
                  />
                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-[#6B39A7] shrink-0" />
                      Lembrar deste dispositivo por 30 dias
                    </span>
                    <span className="text-sm sm:text-base text-gray-600 font-medium mt-0.5 leading-snug">
                      Não solicitar código neste navegador nos próximos logins.
                    </span>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting2FA}
                  className="w-full flex justify-center items-center h-[60px] bg-[#6B39A7] hover:bg-[#582d8c] text-white font-bold text-lg sm:text-xl rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(74,38,117,0.5)] cursor-pointer"
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
                    className="text-base font-bold text-[#6B39A7] hover:underline cursor-pointer"
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
          {step === "2fa_setup" && setupSubStep === "qr" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              {/* Barra superior: Voltar + Como funciona? */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIs2FATutorialOpen(false);
                    setStep("credentials");
                    setError2FA(null);
                  }}
                  className="inline-flex items-center gap-2 text-base font-semibold text-slate-600 hover:text-[#6B39A7] transition-colors w-fit -ml-1 cursor-pointer outline-none focus:outline-none"
                >
                  <ArrowLeft size={20} />
                  Voltar ao login
                </button>

                <button
                  type="button"
                  onClick={() => setIs2FATutorialOpen(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6B39A7] bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer shrink-0"
                >
                  <HelpCircle size={16} />
                  Como funciona?
                </button>
              </div>

              {/* Cabeçalho */}
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Ativar Autenticador (2FA)
                </h1>
                <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed mt-2">
                  Escaneie o QR Code abaixo com seu aplicativo autenticador para vincular sua conta.
                </p>
              </div>

              {error2FA && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm sm:text-base font-semibold animate-in fade-in">
                  <AlertCircle size={20} className="shrink-0 text-red-500" />
                  <span>{error2FA}</span>
                </div>
              )}

              {/* Bloco Central do QR Code */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col items-center gap-4 text-center">
                <div className="p-3.5 bg-white rounded-2xl border-2 border-slate-200/90 shadow-xs flex items-center justify-center">
                  {isLoadingSetup || !setupData ? (
                    <div className="w-44 h-44 sm:w-48 sm:h-48 flex flex-col items-center justify-center gap-2.5">
                      <div className="w-8 h-8 border-3 border-purple-200 border-t-[#6B39A7] rounded-full animate-spin"></div>
                      <span className="text-sm text-slate-500 font-medium">Carregando QR...</span>
                    </div>
                  ) : (
                    <img
                      src={setupData.qrCodeDataUrl}
                      alt="QR Code de Configuração 2FA"
                      className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                    />
                  )}
                </div>

                {setupData?.secret && (
                  <button
                    type="button"
                    onClick={() => setShowManualKey(!showManualKey)}
                    className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#6B39A7] hover:underline cursor-pointer"
                  >
                    <Key size={16} className="shrink-0" />
                    <span>
                      {showManualKey ? "Ocultar chave manual" : "Não consegue ler o QR Code? Ver chave manual"}
                    </span>
                  </button>
                )}

                {showManualKey && setupData?.secret && (
                  <div className="w-full p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-left animate-in fade-in shadow-2xs">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Chave de configuração manual
                      </span>
                      <span className="font-mono text-sm sm:text-base font-bold text-slate-900 truncate select-all mt-0.5">
                        {setupData.secret}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="shrink-0 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 hover:text-slate-900 transition-colors font-bold text-sm flex items-center gap-1.5 cursor-pointer"
                      title="Copiar chave"
                    >
                      {copiedSecret ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                      <span>{copiedSecret ? "Copiado" : "Copiar"}</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={isLoadingSetup || !setupData}
                onClick={() => {
                  setError2FA(null);
                  setSetupSubStep("code");
                }}
                className="w-full flex justify-center items-center gap-2 h-14 bg-[#6B39A7] hover:bg-[#582d8c] text-white font-bold text-base sm:text-lg rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-purple-900/15 cursor-pointer outline-none focus:outline-none"
              >
                <span>Avançar</span>
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === "2fa_setup" && setupSubStep === "code" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              {/* Barra superior: Voltar ao QR Code + Como funciona? */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setError2FA(null);
                    setSetupSubStep("qr");
                  }}
                  className="inline-flex items-center gap-2 text-base font-semibold text-slate-600 hover:text-[#6B39A7] transition-colors w-fit -ml-1 cursor-pointer outline-none focus:outline-none"
                >
                  <ArrowLeft size={20} />
                  Voltar ao QR Code
                </button>

                <button
                  type="button"
                  onClick={() => setIs2FATutorialOpen(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6B39A7] bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer shrink-0"
                >
                  <HelpCircle size={16} />
                  Como funciona?
                </button>
              </div>

              {/* Cabeçalho */}
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Digite o código de 6 dígitos
                </h1>
                <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed mt-2">
                  Insira o código temporário exibido no seu aplicativo autenticador para confirmar a ativação.
                </p>
              </div>

              <form onSubmit={handleEnable2FA} className="flex flex-col gap-5">
                {error2FA && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm sm:text-base font-semibold animate-in fade-in">
                    <AlertCircle size={20} className="shrink-0 text-red-500" />
                    <span>{error2FA}</span>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="000 000"
                    value={totpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setTotpCode(val);
                      if (error2FA) setError2FA(null);
                    }}
                    className="w-full bg-slate-50/50 focus:bg-white border-2 border-slate-200 focus:border-[#6B39A7] text-slate-900 rounded-xl h-16 px-4 focus:outline-none focus:ring-4 focus:ring-[#6B39A7]/15 transition-all text-2xl sm:text-3xl font-mono font-bold tracking-[0.45em] text-center shadow-2xs"
                  />
                </div>

                {/* Checkbox Dispositivo Confiável */}
                <label className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50/70 hover:bg-purple-50/40 border border-slate-200 hover:border-purple-200/80 cursor-pointer transition-all select-none text-left">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-[#6B39A7] focus:ring-[#6B39A7] cursor-pointer accent-[#6B39A7]"
                  />
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-[#6B39A7] shrink-0" />
                      Lembrar deste dispositivo por 30 dias
                    </span>
                    <span className="text-sm text-slate-600 font-medium mt-0.5 leading-snug">
                      Não exigir código neste navegador nos próximos acessos.
                    </span>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting2FA || totpCode.length !== 6}
                  className="w-full flex justify-center items-center h-14 bg-[#6B39A7] hover:bg-[#582d8c] text-white font-bold text-base sm:text-lg rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-purple-900/15 cursor-pointer outline-none focus:outline-none"
                >
                  {isSubmitting2FA ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Validar e Ativar 2FA"
                  )}
                </button>
              </form>
            </div>
          )}


          {/* ============================================================ */}
          {/* STEP 4: SALVAR CÓDIGOS DE BACKUP (APÓS ATIVAÇÃO)             */}
          {/* ============================================================ */}
          {step === "2fa_backup_codes" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-sm sm:text-base font-bold text-emerald-800 mb-3.5 shadow-2xs">
                  <Check size={18} className="text-emerald-600" />
                  2FA ativado com sucesso
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2.5 tracking-tight">
                  Guarde seus Códigos
                </h1>
                <p className="text-gray-600 text-base sm:text-lg font-medium leading-relaxed">
                  Estes <strong className="text-gray-800">8 códigos de uso único</strong> são a sua garantia caso perca o celular.
                  Cada código só pode ser usado uma vez para recuperar o acesso.
                </p>
              </div>

              {/* Grid dos 8 Códigos */}
              <div className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-3">
                  {backupCodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-xl py-3.5 px-3 text-center font-mono font-bold text-lg sm:text-xl text-gray-900 tracking-wider shadow-2xs select-all"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyAllCodes}
                    className="flex-1 flex items-center justify-center gap-2 h-13 bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 font-bold text-base rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
                  >
                    {copiedCodes ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                    <span>Copiar Todos</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCodes}
                    className="flex-1 flex items-center justify-center gap-2 h-13 bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 font-bold text-base rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
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
                  className="w-5 h-5 mt-1 rounded border-gray-300 text-[#6B39A7] focus:ring-[#6B39A7] cursor-pointer accent-[#6B39A7]"
                />
                <label
                  htmlFor="confirmBackup"
                  className="text-base text-gray-700 font-medium cursor-pointer select-none leading-relaxed"
                >
                  Confirmo que copiei ou baixei meus 8 códigos de emergência e os guardei em um local seguro.
                </label>
              </div>

              {/* Botão de Avançar para o Dashboard */}
              <button
                type="button"
                disabled={!confirmedSavedCodes}
                onClick={() => saveSessionAndRedirect(savedSessionData, pendingUser?.email || email)}
                className="w-full flex justify-center items-center h-[60px] bg-[#6B39A7] hover:bg-[#582d8c] text-white font-bold text-lg sm:text-xl rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-900/15 cursor-pointer outline-none focus:outline-none"
              >
                Concluir e Acessar Dashboard
              </button>
            </div>
          )}

        </div>
      </div>

      {/* LADO DIREITO: IMAGEM HERO / BRANDING (APENAS CREDENCIAIS) */}
      {isSplitLayout && (
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
      )}
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