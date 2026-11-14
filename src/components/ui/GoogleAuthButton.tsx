"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const GOOGLE_GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const DEFAULT_GOOGLE_CLIENT_ID =
  "748823016696-4sipdo1rpjk4n2ccfbm422vrh9b8430m.apps.googleusercontent.com";

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenErrorResponse {
  type?: string;
  message?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

interface GoogleOAuthWindow extends Window {
  google?: {
    accounts?: {
      oauth2?: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: GoogleTokenResponse) => void | Promise<void>;
          error_callback?: (error: GoogleTokenErrorResponse) => void;
        }) => GoogleTokenClient;
      };
    };
  };
}

function getGoogleOAuth2() {
  if (typeof window === "undefined") return undefined;
  return (window as GoogleOAuthWindow).google?.accounts?.oauth2;
}

let googleScriptPromise: Promise<void> | null = null;

function ensureGoogleGsiLoaded(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (getGoogleOAuth2()) {
    return Promise.resolve();
  }
  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_GSI_SCRIPT_SRC}"]`,
    );
    if (existing) {
      if (getGoogleOAuth2()) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => {
          googleScriptPromise = null;
          reject(new Error("Não foi possível carregar o serviço do Google."));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      googleScriptPromise = null;
      reject(new Error("Não foi possível carregar o serviço do Google."));
    };
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

interface GoogleAuthButtonProps {
  onSuccess: (accessToken: string) => void | Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
  className?: string;
}

export default function GoogleAuthButton({
  onSuccess,
  onError,
  disabled = false,
  isLoading = false,
  label = "Continuar com o Google",
  className = "",
}: GoogleAuthButtonProps) {
  const [isOpeningPopup, setIsOpeningPopup] = useState(false);

  useEffect(() => {
    ensureGoogleGsiLoaded().catch(() => {});
  }, []);

  const triggerGoogleFlow = async () => {
    if (disabled || isLoading || isOpeningPopup) return;

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || DEFAULT_GOOGLE_CLIENT_ID;

    setIsOpeningPopup(true);
    try {
      if (!getGoogleOAuth2()) {
        await ensureGoogleGsiLoaded();
      }

      const oauth2 = getGoogleOAuth2();
      if (!oauth2?.initTokenClient) {
        throw new Error(
          "Serviço de autenticação do Google indisponível no momento. Tente novamente.",
        );
      }

      const tokenClient = oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (tokenResponse: GoogleTokenResponse) => {
          if (tokenResponse?.error) {
            setIsOpeningPopup(false);
            if (tokenResponse.error !== "access_denied") {
              onError?.(
                "Não foi possível conectar sua conta do Google. Tente novamente.",
              );
            }
            return;
          }

          if (!tokenResponse?.access_token) {
            setIsOpeningPopup(false);
            onError?.("O Google não retornou um token de acesso válido.");
            return;
          }

          try {
            await onSuccess(tokenResponse.access_token);
          } finally {
            setIsOpeningPopup(false);
          }
        },
        error_callback: (err: GoogleTokenErrorResponse) => {
          setIsOpeningPopup(false);
          if (err?.type === "popup_closed") {
            return;
          }
          if (err?.type === "popup_failed_to_open") {
            onError?.(
              "O navegador bloqueou a janela do Google. Permita pop-ups para localhost e tente novamente.",
            );
            return;
          }
          onError?.("Não foi possível abrir o login com o Google.");
        },
      });

      tokenClient.requestAccessToken({ prompt: "select_account" });
    } catch (err: unknown) {
      setIsOpeningPopup(false);
      onError?.(
        err instanceof Error && err.message
          ? err.message
          : "Não foi possível conectar com o Google. Verifique sua conexão e tente novamente.",
      );
    }
  };

  const busy = isLoading || isOpeningPopup;

  return (
    <button
      type="button"
      onClick={triggerGoogleFlow}
      disabled={disabled || busy}
      className={`w-full flex items-center justify-center gap-3.5 h-[56px] sm:h-[58px] px-6 bg-white hover:bg-gray-50/90 text-[#1F1F1F] font-semibold text-base sm:text-lg rounded-full border border-gray-300 hover:border-gray-400 shadow-xs transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {busy ? (
        <Loader2 className="w-5 h-5 animate-spin text-[#6B39A7]" />
      ) : (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.45c-.28 1.49-1.12 2.75-2.39 3.6v2.99h3.87c2.26-2.08 3.56-5.15 3.56-8.62Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-2.99c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.08A11.99 11.99 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.3A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.38-2.3V6.62H1.28A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4-3.08Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.28 6.62l4 3.08C6.23 6.86 8.88 4.75 12 4.75Z"
          />
        </svg>
      )}
      <span>{busy ? "Conectando com o Google..." : label}</span>
    </button>
  );
}
