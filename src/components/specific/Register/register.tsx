"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, forwardRef, InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeClosed, Lock, Mail, User, Building2, ArrowLeft, ArrowRight, FileText, IdCard, UploadCloud, CheckCircle, CheckCircle2, X, LucideIcon, Loader2, MapPin, Phone, MessageCircle, KeyRound, Landmark, AlertTriangle, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";

// Importações dos serviços
import {
  registerOng,
  lookupCep,
  lookupCnpj,
  lookupPixKey,
  type CnpjLookupResult,
  type PixKeyLookupResult,
  type OngOnboardingSummary,
} from "@/services/register-ong.service";
import { registerDonor, checkAvailability } from "@/services/register.service";
import { formatCNPJ, removeFormatting, validateCNPJ, formatCPF, validateCPF, formatCEP, formatBrazilianPhone } from "@/utils/documentValidation";
import TermosModal from "@/components/shared/TermosModal";
import OngKycSelfieStep from "@/components/specific/Register/OngKycSelfieStep";

// ==========================================
// 1. TIPAGENS E SCHEMAS
// ==========================================
type AccountType = "donor" | "ong" | null;

const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;

function getPasswordChecks(password: string, accountType: AccountType) {
  const minLength = accountType === "ong" ? 10 : 8;
  return [
    {
      key: "length",
      label: `Mínimo de ${minLength} caracteres${accountType === "ong" ? " (conta ONG)" : ""}`,
      met: password.length >= minLength && password.length <= 128,
      error: password.length > 128 ? "A senha deve ter no máximo 128 caracteres" : `Mínimo de ${minLength} caracteres`,
    },
    {
      key: "upper",
      label: "1 letra maiúscula (A-Z)",
      met: /[A-Z]/.test(password),
      error: "A senha deve conter pelo menos uma letra maiúscula",
    },
    {
      key: "lower",
      label: "1 letra minúscula (a-z)",
      met: /[a-z]/.test(password),
      error: "A senha deve conter pelo menos uma letra minúscula",
    },
    {
      key: "digit",
      label: "1 número (0-9)",
      met: /[0-9]/.test(password),
      error: "A senha deve conter pelo menos um número",
    },
    {
      key: "special",
      label: "1 caractere especial (!@#$...)",
      met: PASSWORD_SPECIAL_REGEX.test(password),
      error: "A senha deve conter pelo menos um caractere especial",
    },
  ];
}

const registerSchema = z.object({
  accountType: z.enum(["donor", "ong"]).nullable(),
  nome: z.string().min(3, "Mínimo de 3 caracteres"),
  email: z.string().min(1, "O e-mail é obrigatório").email("E-mail inválido"),
  senha: z.string().min(1, "A senha é obrigatória"),
  confirmarSenha: z.string().min(1, "Confirme sua senha"),
  documento: z.string().min(1, "Documento é obrigatório"),
  cep: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  pixKey: z.string().optional(),
  nomePresidente: z.string().optional(),
  cpfPresidente: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.accountType === "donor" && /\d/.test(data.nome)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Não pode conter números", path: ["nome"] });
  }

  // Validação de Senha alinhada ao PasswordPolicyService do backend
  if (data.senha.length > 0) {
    const failedCheck = getPasswordChecks(data.senha, data.accountType).find((c) => !c.met);
    if (failedCheck) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: failedCheck.error, path: ["senha"] });
    }
  }

  if (data.senha !== data.confirmarSenha) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "As senhas não coincidem", path: ["confirmarSenha"] });
  }

  // Validação de CNPJ/CPF
  const docNumbers = removeFormatting(data.documento);
  if (data.accountType === "ong" && (docNumbers.length !== 14 || !validateCNPJ(data.documento))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CNPJ inválido", path: ["documento"] });
  } else if (data.accountType === "donor" && (docNumbers.length !== 11 || !validateCPF(data.documento))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CPF inválido", path: ["documento"] });
  }

  // Validação Documentação Extra ONG
  if (data.accountType === "ong") {
    if (!data.nomePresidente || data.nomePresidente.trim().length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nome do Presidente inválido", path: ["nomePresidente"] });
    }
    const cpfPresNumbers = data.cpfPresidente ? removeFormatting(data.cpfPresidente) : "";
    if (!data.cpfPresidente || cpfPresNumbers.length !== 11 || !validateCPF(data.cpfPresidente)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CPF do Presidente inválido", path: ["cpfPresidente"] });
    }
  }
});

type RegisterFormData = z.infer<typeof registerSchema>;

// ==========================================
// 2. COMPONENTES DE UI
// ==========================================

// --- InputField Reutilizável ---
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon: LucideIcon;
  error?: string;
  isLoading?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, icon: Icon, error, isLoading, type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-2">
        {label && <label className="text-gray-800 text-base font-bold tracking-wide">{label}</label>}
        <div className="relative group">
          <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-500' : 'text-gray-400 group-focus-within:text-[#6B39A7]'}`} size={22} />
          <input
            ref={ref}
            type={inputType}
            className={`w-full bg-white border text-gray-900 rounded-xl pl-12 ${isPassword || isLoading ? 'pr-12' : 'pr-4'} py-4 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-lg font-medium shadow-sm ${error ? "border-red-400 focus:border-red-500 ring-red-100 ring-2 animate-[shake_0.5s_ease-in-out]" : "border-gray-200 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7]"}`}
            {...props}
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B39A7]">
              <Loader2 size={20} className="animate-spin" />
            </div>
          )}
          {isPassword && !isLoading && (
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6B39A7] w-6 h-6 flex items-center justify-center cursor-pointer">
              <div className={`absolute transition-all duration-300 ${showPassword ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}>
                <Eye size={22} />
              </div>
              <div className={`absolute transition-all duration-300 ${showPassword ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}>
                <EyeClosed size={22} />
              </div>
            </button>
          )}
        </div>
        {error && (
          <span className="text-red-500 text-sm font-bold mt-1">{error}</span>
        )}
      </div>
    );
  }
);
InputField.displayName = "InputField";

// --- Step 1: Seleção de Perfil ---
function AccountTypeSelection({ onSelect }: { onSelect: (type: AccountType) => void }) {
  const options = [
    {
      type: "donor",
      icon: User,
      title: "Sou Doador(a)",
      desc: "Quero apoiar campanhas verificadas, doar com segurança e acompanhar cada impacto.",
    },
    {
      type: "ong",
      icon: Building2,
      title: "Represento uma ONG",
      desc: "Quero validar nossa instituição, habilitar repasses via Pix e receber doações.",
    },
  ];

  return (
    <>
      <div className="mb-10 text-left">
        <h1 className="text-4xl sm:text-[3rem] font-bold text-gray-900 mb-2 tracking-tight leading-tight">
          Crie sua conta no DoeCerto
        </h1>
        <p className="text-gray-500 text-lg font-medium leading-relaxed">
          Escolha seu perfil para liberarmos as etapas certas para você.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {options.map((opt) => (
          <button key={opt.type} onClick={() => onSelect(opt.type as AccountType)} className="group relative flex items-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#6B39A7] hover:shadow-[0_8px_30px_-10px_rgba(107,57,167,0.2)] transition-all duration-300 text-left active:scale-[0.98]">
            <div className="w-14 h-14 rounded-full bg-[#F3E8FF] flex items-center justify-center mr-5 shrink-0 group-hover:bg-[#6B39A7] transition-colors duration-300">
              <opt.icon className="text-[#6B39A7] group-hover:text-white transition-colors duration-300" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{opt.title}</h3>
              <p className="text-gray-500 text-sm font-medium">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

// --- Dropzone Animado ---
function FileDropzone({ title, subtitle, file, setFile }: { title: string, subtitle: string, file: File | null, setFile: (file: File | null) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>(file ? 'success' : 'idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const processFile = (selectedFile: File) => {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowedTypes.includes(selectedFile.type) && !/\.(pdf|png|jpe?g)$/i.test(selectedFile.name)) {
      toast.error("Formato não aceito. Envie PDF, PNG ou JPG.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("O arquivo ultrapassa o limite máximo de 10 MB.");
      return;
    }

    setFile(selectedFile);
    setUploadState('uploading');
    setUploadProgress(0);

    let currentProgress = 0;
    intervalRef.current = setInterval(() => {
      let increment = Math.random() * 8 + 2;
      if (currentProgress > 60) increment = Math.random() * 4 + 1;
      if (currentProgress > 85) increment = Math.random() * 1.5;

      currentProgress += increment;

      if (currentProgress >= 100) {
        currentProgress = 100;
        setUploadProgress(100);
        if (intervalRef.current) clearInterval(intervalRef.current);

        setTimeout(() => {
          setUploadState('success');
          toast.success(`${title} anexado!`);
        }, 600);
      } else {
        setUploadProgress(Math.floor(currentProgress));
      }
    }, 120);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setUploadState('idle');
    setFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-gray-800 text-base font-bold tracking-wide">{title}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        className={`relative w-full h-[200px] rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 overflow-hidden ${uploadState === 'idle'
          ? isDragging ? "border-2 border-dashed border-[#6B39A7] bg-purple-100/60 scale-[1.02] shadow-lg shadow-purple-500/10" : "border-2 border-dashed border-gray-300 hover:border-[#6B39A7] bg-gray-50/70 hover:bg-purple-50/30"
          : "border border-gray-200 bg-white shadow-sm"
          }`}
      >
        {uploadState === 'idle' && (
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} accept=".pdf,.png,.jpg,.jpeg" />
        )}

        {uploadState === 'idle' && (
          <div className="w-full flex flex-col items-center z-10 pointer-events-none px-4">
            <div className={`p-4 rounded-full mb-3 transition-all duration-500 ease-out ${isDragging ? 'bg-[#6B39A7] text-white scale-110 -translate-y-2' : 'bg-purple-100 text-[#6B39A7]'}`}>
              <UploadCloud size={32} strokeWidth={2.2} />
            </div>
            <p className="text-base font-bold text-gray-800 mb-1 transition-colors">{isDragging ? "Solte o arquivo agora" : subtitle}</p>
            <p className="text-sm text-gray-500 font-medium">PDF, PNG ou JPG (Máx 10MB)</p>
          </div>
        )}

        {uploadState === 'uploading' && file && (
          <div className="w-full h-full p-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 bg-gray-50/60">
            <p className="text-sm font-bold text-[#6B39A7] mb-4 animate-pulse">Processando arquivo...</p>
            <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F3E8FF] text-[#6B39A7] rounded-lg flex items-center justify-center shrink-0 animate-bounce">
                  <FileText size={20} strokeWidth={2.2} />
                </div>
                <div className="flex-1 flex flex-col text-left overflow-hidden">
                  <span className="text-sm font-bold text-gray-800 truncate">{file.name}</span>
                  <span className="text-xs text-gray-500 font-medium">{formatFileSize(file.size)}</span>
                </div>
              </div>
              <div className="w-full flex items-center gap-3 mt-1">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-[#9F7AEA] to-[#6B39A7] transition-all duration-300 ease-out relative" style={{ width: `${uploadProgress}%` }}>
                    <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[pulse_1.5s_infinite]"></div>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-600 w-8 text-right tabular-nums">{uploadProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {uploadState === 'success' && file && (
          <div className="w-full h-full flex items-center justify-between p-6 bg-emerald-50/30 border border-emerald-200/60 rounded-2xl animate-in slide-in-from-bottom-2 fade-in duration-500 ease-out">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-300 rounded-full animate-ping opacity-30"></div>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 relative z-10">
                  <CheckCircle size={26} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-base font-bold text-gray-800 truncate max-w-[220px]">{file.name}</span>
                <span className="text-sm text-emerald-600 font-semibold">{formatFileSize(file.size)} • Concluído</span>
              </div>
            </div>
            <button type="button" onClick={handleRemove} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Remover arquivo">
              <X size={22} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. CUSTOM HOOK
// ==========================================
function useRegisterForm() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [successModalAberto, setSuccessModalAberto] = useState(false);

  const [fileEstatuto, setFileEstatuto] = useState<File | null>(null);
  const [fileAta, setFileAta] = useState<File | null>(null);
  const [fileCartaoCnpj, setFileCartaoCnpj] = useState<File | null>(null);

  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingDocumento, setIsCheckingDocumento] = useState(false);
  const [isLookingUpCnpj, setIsLookingUpCnpj] = useState(false);
  const [isLookingUpCep, setIsLookingUpCep] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [isLookingUpPix, setIsLookingUpPix] = useState(false);

  const [cnpjMeta, setCnpjMeta] = useState<CnpjLookupResult | null>(null);
  const [cnpjAutoFilledAddress, setCnpjAutoFilledAddress] = useState(false);
  const [cepGeoVerified, setCepGeoVerified] = useState(false);
  const [pixLookupResult, setPixLookupResult] = useState<PixKeyLookupResult | null>(null);
  const [sameWhatsappAsPhone, setSameWhatsappAsPhone] = useState(true);
  const [kycSession, setKycSession] = useState<{
    ongName: string;
    email: string;
    onboardingKycToken?: string;
    initialOnboarding?: OngOnboardingSummary;
  } | null>(null);

  // Cache em memória para evitar requisições repetidas ao mesmo CPF/CNPJ/Email/CEP/Pix
  const lastCheckedEmailRef = useRef<{ value: string; available: boolean; message?: string } | null>(null);
  const lastCheckedDocRef = useRef<{ value: string; available: boolean; message?: string } | null>(null);
  const lastLookedUpCnpjRef = useRef<string | null>(null);
  const lastLookedUpCepRef = useRef<string | null>(null);
  const lastValidatedPixRef = useRef<{ key: string; cnpj: string; result: PixKeyLookupResult } | null>(null);
  const cnpjAutofillRef = useRef<{
    cnpj: string;
    nome?: string;
    telefone?: string;
    hasAddress: boolean;
  } | null>(null);
  const inFlightCnpjLookupRef = useRef<{
    cnpj: string;
    promise: Promise<void>;
  } | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType: null,
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      documento: "",
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      telefone: "",
      whatsapp: "",
      pixKey: "",
      nomePresidente: "",
      cpfPresidente: ""
    }
  });

  useEffect(() => {
    const draft = sessionStorage.getItem("register_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        form.reset(parsed.formData);
        const restoredStep = parsed.step >= 1 && parsed.step <= 4 ? parsed.step : 1;
        setStep(restoredStep);
        setAccountType(parsed.accountType || null);
      } catch {
        setStep(1);
        setAccountType(null);
        form.reset();
      }
    } else {
      setStep(1);
      setAccountType(null);
      form.reset();
    }
    setIsChecking(false);
  }, [router, form]);

  useEffect(() => {
    if (isChecking || step >= 5) return;
    // WEB-02: Nunca persiste senhas, CPFs/documentos ou chaves Pix em texto puro no sessionStorage
    const subscription = form.watch((value) => {
      const safeFormData = {
        ...value,
        senha: "",
        confirmarSenha: "",
        documento: "",
        cpfPresidente: "",
        pixKey: "",
      };
      sessionStorage.setItem("register_draft", JSON.stringify({ step, accountType, formData: safeFormData }));
    });
    return () => subscription.unsubscribe();
  }, [form.watch, step, accountType, isChecking]);

  const clearDraft = () => {
    setStep(1);
    setAccountType(null);
    lastCheckedEmailRef.current = null;
    lastCheckedDocRef.current = null;
    lastLookedUpCnpjRef.current = null;
    lastLookedUpCepRef.current = null;
    lastValidatedPixRef.current = null;
    cnpjAutofillRef.current = null;
    inFlightCnpjLookupRef.current = null;
    setCnpjMeta(null);
    setCnpjAutoFilledAddress(false);
    setCepGeoVerified(false);
    setPixLookupResult(null);
    setSameWhatsappAsPhone(true);
    setKycSession(null);
    form.reset({
      accountType: null,
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      documento: "",
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      telefone: "",
      whatsapp: "",
      pixKey: "",
      nomePresidente: "",
      cpfPresidente: ""
    });
    setFileEstatuto(null); setFileAta(null); setFileCartaoCnpj(null);
    setTimeout(() => { sessionStorage.removeItem("register_draft"); }, 50);
  };

  const handleSelectType = (type: AccountType) => {
    setAccountType(type);
    form.setValue("accountType", type);
    setStep(2);
  };

  const handleEmailBlur = async (emailValue: string) => {
    const clean = emailValue.trim().toLowerCase();
    if (!clean) return;
    const isSyntaxValid = await form.trigger("email");
    if (!isSyntaxValid) return;

    // Se já verificou exatamente este mesmo e-mail, usa o resultado em memória
    if (lastCheckedEmailRef.current?.value === clean) {
      if (!lastCheckedEmailRef.current.available) {
        form.setError("email", {
          type: "manual",
          message: lastCheckedEmailRef.current.message || "Este e-mail já está cadastrado no DoeCerto.",
        });
      } else {
        form.clearErrors("email");
      }
      return;
    }

    setIsCheckingEmail(true);
    try {
      const res = await checkAvailability({ email: clean });
      if (res.rateLimited) {
        form.setError("email", {
          type: "manual",
          message: res.message || "Muitas tentativas em pouco tempo. Aguarde alguns segundos.",
        });
        return;
      }

      lastCheckedEmailRef.current = { value: clean, available: res.available, message: res.message };
      if (!res.available) {
        form.setError("email", {
          type: "manual",
          message: res.message || "Este e-mail já está cadastrado no DoeCerto.",
        });
      } else {
        form.clearErrors("email");
      }
    } catch {
      /* noop */
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const resetCnpjAutofilledFields = () => {
    const prevAuto = cnpjAutofillRef.current;
    if (prevAuto) {
      if (prevAuto.nome && form.getValues("nome")?.trim() === prevAuto.nome) {
        form.setValue("nome", "");
        form.clearErrors("nome");
      }
      if (prevAuto.telefone && form.getValues("telefone")?.trim() === prevAuto.telefone) {
        form.setValue("telefone", "");
        form.clearErrors("telefone");
      }
      if (prevAuto.hasAddress) {
        const addressFields = ["cep", "rua", "numero", "complemento", "bairro", "cidade", "uf"] as const;
        for (const field of addressFields) {
          form.setValue(field, "");
        }
        form.clearErrors(addressFields);
      }
      const currentPixDigits = removeFormatting(form.getValues("pixKey") || "");
      if (currentPixDigits && currentPixDigits === prevAuto.cnpj) {
        form.setValue("pixKey", "");
        form.clearErrors("pixKey");
      }
    }

    cnpjAutofillRef.current = null;
    lastLookedUpCepRef.current = null;
    lastValidatedPixRef.current = null;
    setCnpjAutoFilledAddress(false);
    setCepGeoVerified(false);
    setPixLookupResult(null);
  };

  const verifyCepCoordinatesFromCnpj = async (cleanCep: string, expectedCnpj: string) => {
    if (cleanCep.length !== 8) return;
    try {
      const cepData = await lookupCep(cleanCep);
      // Descarta se o usuário trocou de CNPJ enquanto a geolocalização do CEP ainda carregava
      if (removeFormatting(form.getValues("documento") || "") !== expectedCnpj) return;

      lastLookedUpCepRef.current = cleanCep;
      if (!form.getValues("rua")?.trim() && cepData.street) form.setValue("rua", cepData.street);
      if (!form.getValues("bairro")?.trim() && cepData.neighborhood) form.setValue("bairro", cepData.neighborhood);
      if (!form.getValues("cidade")?.trim() && cepData.city) form.setValue("cidade", cepData.city);
      if (!form.getValues("uf")?.trim() && cepData.state) form.setValue("uf", cepData.state.toUpperCase());
      setCepGeoVerified(typeof cepData.latitude === "number" && typeof cepData.longitude === "number");
    } catch {
      /* Mantém os campos já preenchidos pela Receita Federal mesmo se o CEP v2 oscilar */
    }
  };

  const performCnpjLookup = async (cleanCnpj: string) => {
    if (cleanCnpj.length !== 14) return;
    if (inFlightCnpjLookupRef.current?.cnpj === cleanCnpj) {
      return inFlightCnpjLookupRef.current.promise;
    }
    if (lastLookedUpCnpjRef.current === cleanCnpj) return;

    // Se havia dados auto-preenchidos de um CNPJ anterior, limpa antes de consultar o novo CNPJ
    if (cnpjAutofillRef.current && cnpjAutofillRef.current.cnpj !== cleanCnpj) {
      resetCnpjAutofilledFields();
    }

    const task = (async () => {
      setIsLookingUpCnpj(true);
      try {
        const res = await lookupCnpj(cleanCnpj);
        // Garante que uma resposta atrasada não sobrescreva caso o usuário já tenha alterado o CNPJ
        if (removeFormatting(form.getValues("documento") || "") !== cleanCnpj) return;

        lastLookedUpCnpjRef.current = cleanCnpj;
        setCnpjMeta(res);

        if (res.found) {
          const nextAuto: {
            cnpj: string;
            nome?: string;
            telefone?: string;
            hasAddress: boolean;
          } = { cnpj: cleanCnpj, hasAddress: false };

          const currentName = form.getValues("nome")?.trim();
          const suggestedName = (res.nomeFantasia || res.razaoSocial || "").trim().slice(0, 100);
          if (!currentName && suggestedName) {
            form.setValue("nome", suggestedName);
            form.clearErrors("nome");
            nextAuto.nome = suggestedName;
          }

          const currentPhone = form.getValues("telefone")?.trim();
          if (!currentPhone && res.phone) {
            const maskedPhone = formatBrazilianPhone(res.phone);
            if (maskedPhone.length >= 14) {
              form.setValue("telefone", maskedPhone);
              form.clearErrors("telefone");
              nextAuto.telefone = maskedPhone;
            }
          }

          const hasManualAddress = Boolean(
            form.getValues("cep")?.trim() ||
              form.getValues("rua")?.trim() ||
              form.getValues("bairro")?.trim() ||
              form.getValues("cidade")?.trim(),
          );

          if (!hasManualAddress && res.address?.zipCode) {
            const cleanZip = removeFormatting(res.address.zipCode);
            form.setValue("cep", formatCEP(res.address.zipCode));
            if (res.address.street) form.setValue("rua", res.address.street);
            if (res.address.number) form.setValue("numero", res.address.number);
            if (
              res.address.complement &&
              res.address.complement.trim().toLowerCase() !== "undefined" &&
              res.address.complement.trim().toLowerCase() !== "null"
            ) {
              form.setValue("complemento", res.address.complement.trim());
            }
            if (res.address.neighborhood) form.setValue("bairro", res.address.neighborhood);
            if (res.address.city) form.setValue("cidade", res.address.city);
            if (res.address.state) form.setValue("uf", res.address.state.toUpperCase());
            form.clearErrors(["cep", "rua", "numero", "complemento", "bairro", "cidade", "uf"]);

            nextAuto.hasAddress = true;
            setCnpjAutoFilledAddress(true);
            void verifyCepCoordinatesFromCnpj(cleanZip, cleanCnpj);
          }

          cnpjAutofillRef.current = nextAuto;
        }
      } catch {
        /* Consulta oficial best-effort não bloqueia preenchimento manual */
      } finally {
        if (inFlightCnpjLookupRef.current?.cnpj === cleanCnpj) {
          inFlightCnpjLookupRef.current = null;
        }
        setIsLookingUpCnpj(false);
      }
    })();

    inFlightCnpjLookupRef.current = { cnpj: cleanCnpj, promise: task };
    return task;
  };

  const handleDocumentoChange = (rawValue: string) => {
    const formatted = accountType === "ong" ? formatCNPJ(rawValue) : formatCPF(rawValue);
    form.setValue("documento", formatted);
    form.clearErrors("documento");

    if (accountType !== "ong") return;

    const cleanDigits = removeFormatting(formatted);
    if (cleanDigits !== lastLookedUpCnpjRef.current) {
      setCnpjMeta(null);
      lastLookedUpCnpjRef.current = null;
    }

    if (cleanDigits.length === 0 && cnpjAutofillRef.current) {
      resetCnpjAutofilledFields();
      return;
    }

    if (cleanDigits.length === 14 && validateCNPJ(formatted)) {
      void performCnpjLookup(cleanDigits);
    }
  };

  const handleDocumentoBlur = async (docValue: string) => {
    const clean = removeFormatting(docValue);
    if (!clean) return;
    const isSyntaxValid = await form.trigger("documento");
    if (!isSyntaxValid) return;

    // Se já verificou exatamente este mesmo documento, usa o resultado em memória sem nova requisição
    if (lastCheckedDocRef.current?.value === clean) {
      if (!lastCheckedDocRef.current.available) {
        form.setError("documento", {
          type: "manual",
          message: lastCheckedDocRef.current.message || (accountType === "ong" ? "Este CNPJ já possui cadastro no DoeCerto." : "Este CPF já possui cadastro no DoeCerto."),
        });
      } else {
        form.clearErrors("documento");
        if (accountType === "ong") {
          performCnpjLookup(clean);
        }
      }
      return;
    }

    setIsCheckingDocumento(true);
    try {
      const query = accountType === "ong" ? { cnpj: clean } : { cpf: clean };
      const res = await checkAvailability(query);
      if (res.rateLimited) {
        form.setError("documento", {
          type: "manual",
          message: res.message || "Muitas tentativas em pouco tempo. Aguarde alguns segundos.",
        });
        return;
      }

      lastCheckedDocRef.current = { value: clean, available: res.available, message: res.message };
      if (!res.available) {
        form.setError("documento", {
          type: "manual",
          message: res.message || (accountType === "ong" ? "Este CNPJ já possui cadastro no DoeCerto." : "Este CPF já possui cadastro no DoeCerto."),
        });
      } else {
        form.clearErrors("documento");
        if (accountType === "ong") {
          performCnpjLookup(clean);
        }
      }
    } catch {
      /* noop */
    } finally {
      setIsCheckingDocumento(false);
    }
  };

  const handleCepLookup = async (rawCep: string, force = false) => {
    const cleanCep = removeFormatting(rawCep);
    if (cleanCep.length !== 8) {
      setCepGeoVerified(false);
      return;
    }
    if (!force && lastLookedUpCepRef.current === cleanCep) return;

    setIsLookingUpCep(true);
    try {
      const data = await lookupCep(cleanCep);
      lastLookedUpCepRef.current = cleanCep;
      form.setValue("cep", formatCEP(data.zipCode || cleanCep));
      if (data.street) form.setValue("rua", data.street);
      if (data.neighborhood) form.setValue("bairro", data.neighborhood);
      if (data.city) form.setValue("cidade", data.city);
      if (data.state) form.setValue("uf", data.state.toUpperCase());
      form.clearErrors(["cep", "rua", "bairro", "cidade", "uf"]);
      setCepGeoVerified(typeof data.latitude === "number" && typeof data.longitude === "number");
    } catch (err: any) {
      setCepGeoVerified(false);
      form.setError("cep", {
        type: "manual",
        message: err?.message || "CEP não encontrado. Verifique os dígitos.",
      });
    } finally {
      setIsLookingUpCep(false);
    }
  };

  const handleCepChange = (rawValue: string) => {
    const formatted = formatCEP(rawValue);
    form.setValue("cep", formatted);
    form.clearErrors("cep");
    setCnpjAutoFilledAddress(false);

    const cleanCep = removeFormatting(formatted);
    if (cleanCep !== lastLookedUpCepRef.current) {
      setCepGeoVerified(false);
    }
    if (cleanCep.length === 8) {
      void handleCepLookup(formatted);
    }
  };

  const handlePhoneBlur = async (phoneValue: string) => {
    const digits = removeFormatting(phoneValue);
    if (digits.length < 10) return;

    setIsCheckingPhone(true);
    try {
      const res = await checkAvailability({ phone: digits });
      if (!res.available && !res.rateLimited) {
        form.setError("telefone", {
          type: "manual",
          message: res.message || "Este telefone já possui cadastro no DoeCerto.",
        });
      } else {
        form.clearErrors("telefone");
      }
    } catch {
      /* noop */
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handlePixKeyLookup = async (rawPixKey?: string): Promise<PixKeyLookupResult | null> => {
    const pixValue = (rawPixKey ?? form.getValues("pixKey") ?? "").trim();
    const cleanCnpj = removeFormatting(form.getValues("documento") || "");
    if (!pixValue) {
      setPixLookupResult(null);
      return null;
    }
    if (cleanCnpj.length !== 14) {
      form.setError("pixKey", { type: "manual", message: "Preencha um CNPJ válido antes de validar a chave Pix." });
      return null;
    }

    if (
      lastValidatedPixRef.current &&
      lastValidatedPixRef.current.key === pixValue &&
      lastValidatedPixRef.current.cnpj === cleanCnpj
    ) {
      form.clearErrors("pixKey");
      setPixLookupResult(lastValidatedPixRef.current.result);
      return lastValidatedPixRef.current.result;
    }

    setIsLookingUpPix(true);
    try {
      const res = await lookupPixKey(pixValue, cleanCnpj);
      lastValidatedPixRef.current = { key: pixValue, cnpj: cleanCnpj, result: res };
      setPixLookupResult(res);
      form.clearErrors("pixKey");
      return res;
    } catch (err: any) {
      setPixLookupResult(null);
      lastValidatedPixRef.current = null;
      const msg = err?.message || "Chave Pix inválida para pessoa jurídica.";
      form.setError("pixKey", { type: "manual", message: msg });
      return null;
    } finally {
      setIsLookingUpPix(false);
    }
  };

  const handleNextStep = async () => {
    const isValid = await form.trigger(["nome", "email", "senha", "confirmarSenha", "documento"]);
    if (!isValid) {
      toast.error("Por favor, verifique os campos destacados em vermelho.");
      return;
    }

    // Validação assíncrona de duplicidade no backend antes de prosseguir
    const data = form.getValues();
    setIsPending(true);
    try {
      const docClean = removeFormatting(data.documento);
      const query = {
        email: data.email.trim(),
        ...(accountType === "ong" ? { cnpj: docClean } : { cpf: docClean }),
      };
      const res = await checkAvailability(query);
      if (!res.available) {
        if (res.rateLimited) {
          toast.error(res.message || "Muitas tentativas em pouco tempo. Aguarde alguns segundos.");
          return;
        }
        if (res.field === "email") {
          form.setError("email", {
            type: "manual",
            message: res.message || "Este e-mail já está cadastrado no DoeCerto.",
          });
          toast.error(res.message || "Este e-mail já está cadastrado no DoeCerto.");
        } else {
          form.setError("documento", {
            type: "manual",
            message: res.message || "Este documento já possui cadastro no DoeCerto.",
          });
          toast.error(res.message || "Este documento já possui cadastro no DoeCerto.");
        }
        return;
      }

      if (accountType === "ong") {
        await performCnpjLookup(docClean);
        setStep(3);
      } else {
        setModalAberto(true);
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao verificar dados. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  };

  const handleNextOperationalStep = async () => {
    const values = form.getValues();
    let hasError = false;
    form.clearErrors(["cep", "rua", "numero", "bairro", "cidade", "uf", "telefone", "whatsapp", "pixKey"]);

    const cepDigits = removeFormatting(values.cep || "");
    if (cepDigits.length !== 8) {
      form.setError("cep", { type: "manual", message: "Informe um CEP válido com 8 dígitos." });
      hasError = true;
    }
    if (!values.rua?.trim()) {
      form.setError("rua", { type: "manual", message: "Logradouro é obrigatório." });
      hasError = true;
    }
    if (!values.numero?.trim()) {
      form.setError("numero", { type: "manual", message: "Número é obrigatório (ou informe S/N)." });
      hasError = true;
    }
    if (!values.bairro?.trim()) {
      form.setError("bairro", { type: "manual", message: "Bairro é obrigatório." });
      hasError = true;
    }
    if (!values.cidade?.trim()) {
      form.setError("cidade", { type: "manual", message: "Cidade é obrigatória." });
      hasError = true;
    }
    const ufClean = (values.uf || "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(ufClean)) {
      form.setError("uf", { type: "manual", message: "UF inválida (ex: SP)." });
      hasError = true;
    }

    const phoneDigits = removeFormatting(values.telefone || "");
    if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      form.setError("telefone", { type: "manual", message: "Telefone inválido. Informe DDD + número." });
      hasError = true;
    }

    if (!sameWhatsappAsPhone && values.whatsapp?.trim()) {
      const waDigits = removeFormatting(values.whatsapp);
      if (waDigits.length !== 10 && waDigits.length !== 11) {
        form.setError("whatsapp", { type: "manual", message: "WhatsApp inválido. Informe DDD + número." });
        hasError = true;
      }
    }

    const pixTrimmed = (values.pixKey || "").trim();
    if (!pixTrimmed) {
      form.setError("pixKey", { type: "manual", message: "Informe a chave Pix da ONG para recebimento." });
      hasError = true;
    }

    if (hasError) {
      toast.error("Revise os campos destacados de endereço, contato e chave Pix.");
      return;
    }

    const pixRes = await handlePixKeyLookup(pixTrimmed);
    if (!pixRes) {
      toast.error("Verifique a chave Pix informada antes de avançar.");
      return;
    }

    setStep(4);
  };

  const handleFinalSubmit = async () => {
    const isValid = await form.trigger(["nomePresidente", "cpfPresidente"]);
    if (!isValid) return;

    if (!fileEstatuto || !fileAta || !fileCartaoCnpj) {
      toast.error("Anexe os 3 documentos obrigatórios (Estatuto, Ata e Cartão CNPJ) para continuar.");
      return;
    }
    setModalAberto(true);
  };

  const submitToApi = async () => {
    setIsPending(true);
    const data = form.getValues();
    try {
      if (data.accountType === 'ong') {
        const formData = new FormData();
        formData.append('name', data.nome.trim());
        formData.append('email', data.email.trim());
        formData.append('password', data.senha);
        formData.append('cnpj', removeFormatting(data.documento));
        formData.append('presidentName', (data.nomePresidente || '').trim());
        formData.append('presidentCpf', removeFormatting(data.cpfPresidente || ''));

        const cleanPhoneDigits = removeFormatting(data.telefone || '');
        if (cleanPhoneDigits) {
          formData.append('contactNumber', `+55${cleanPhoneDigits}`);
        }
        const rawWhatsapp = sameWhatsappAsPhone ? data.telefone : data.whatsapp;
        const cleanWhatsappDigits = removeFormatting(rawWhatsapp || '');
        if (cleanWhatsappDigits) {
          formData.append('whatsappNumber', `+55${cleanWhatsappDigits}`);
        }
        if (data.pixKey?.trim()) {
          formData.append('pixKey', pixLookupResult?.normalizedPixKey || data.pixKey.trim());
        }
        if (data.cep?.trim()) formData.append('zipCode', formatCEP(data.cep));
        if (data.rua?.trim()) formData.append('street', data.rua.trim());
        if (data.numero?.trim()) formData.append('number', data.numero.trim());
        const cleanComplement = data.complemento?.trim();
        if (
          cleanComplement &&
          cleanComplement.toLowerCase() !== 'undefined' &&
          cleanComplement.toLowerCase() !== 'null'
        ) {
          formData.append('complement', cleanComplement);
        }
        if (data.bairro?.trim()) formData.append('neighborhood', data.bairro.trim());
        if (data.cidade?.trim()) formData.append('city', data.cidade.trim());
        if (data.uf?.trim()) formData.append('state', data.uf.trim().toUpperCase());
        formData.append('country', 'Brasil');

        if (fileEstatuto) formData.append('estatuto', fileEstatuto);
        if (fileAta) formData.append('ata', fileAta);
        if (fileCartaoCnpj) formData.append('cartaoCnpj', fileCartaoCnpj);

        const { data: res } = await registerOng(formData);

        setModalAberto(false);
        sessionStorage.removeItem("register_draft");
        setKycSession({
          ongName: res?.user?.name || data.nome,
          email: res?.user?.email || data.email,
          onboardingKycToken: res?.onboardingKycToken,
          initialOnboarding: res?.onboarding,
        });
        setStep(5);
      } else {
        await registerDonor({
          name: data.nome,
          email: data.email,
          password: data.senha,
          cpf: removeFormatting(data.documento)
        });
        setModalAberto(false);
        sessionStorage.removeItem("register_draft");
        setSuccessModalAberto(true);
      }
    } catch (err: any) {
      setModalAberto(false);
      const errorMsg = err?.message || "Ocorreu um erro ao processar o cadastro.";
      const lower = errorMsg.toLowerCase();

      if (lower.includes("e-mail") || lower.includes("email")) {
        setStep(2);
        form.setError("email", {
          type: "manual",
          message: "Este e-mail já está cadastrado no DoeCerto.",
        });
        toast.error("Este e-mail já está cadastrado no DoeCerto.");
      } else if (lower.includes("pix") || lower.includes("chave")) {
        setStep(3);
        form.setError("pixKey", { type: "manual", message: errorMsg });
        toast.error(errorMsg);
      } else if (lower.includes("telefone") || lower.includes("whatsapp")) {
        setStep(3);
        form.setError("telefone", { type: "manual", message: errorMsg });
        toast.error(errorMsg);
      } else if (lower.includes("cep") || lower.includes("endereço") || lower.includes("uf")) {
        setStep(3);
        form.setError("cep", { type: "manual", message: errorMsg });
        toast.error(errorMsg);
      } else if (lower.includes("cpf")) {
        if (data.accountType === "ong") {
          setStep(4);
          form.setError("cpfPresidente", { type: "manual", message: errorMsg });
        } else {
          setStep(2);
          form.setError("documento", {
            type: "manual",
            message: "Este CPF já possui cadastro no DoeCerto.",
          });
        }
        toast.error(errorMsg);
      } else if (lower.includes("cnpj")) {
        setStep(2);
        form.setError("documento", {
          type: "manual",
          message: "Este CNPJ já possui cadastro no DoeCerto.",
        });
        toast.error("Este CNPJ já possui cadastro no DoeCerto.");
      } else if (
        lower.includes("senha") ||
        lower.includes("password") ||
        lower.includes("caracter") ||
        lower.includes("maiúscula") ||
        lower.includes("minúscula") ||
        lower.includes("especial") ||
        lower.includes("vazada") ||
        lower.includes("vazamento")
      ) {
        setStep(2);
        form.setError("senha", {
          type: "manual",
          message: errorMsg,
        });
        toast.error(errorMsg);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsPending(false);
    }
  };

  return {
    form, step, setStep, accountType, isChecking, modalAberto, setModalAberto, isPending, successModalAberto, setSuccessModalAberto,
    clearDraft, handleSelectType, handleNextStep, handleNextOperationalStep, handleFinalSubmit, submitToApi,
    isCheckingEmail, isCheckingDocumento, isLookingUpCnpj, isLookingUpCep, isCheckingPhone, isLookingUpPix,
    cnpjMeta, cnpjAutoFilledAddress, cepGeoVerified, pixLookupResult, setPixLookupResult, sameWhatsappAsPhone, setSameWhatsappAsPhone, kycSession,
    handleEmailBlur, handleDocumentoChange, handleDocumentoBlur, handleCepChange, handleCepLookup, handlePhoneBlur, handlePixKeyLookup,
    files: { fileEstatuto, setFileEstatuto, fileAta, setFileAta, fileCartaoCnpj, setFileCartaoCnpj }
  };
}

// ==========================================
// 4. TELA PRINCIPAL (O Componente Register)
// ==========================================
export default function Register() {
  const {
    form, step, setStep, accountType, isChecking, modalAberto, setModalAberto, isPending, successModalAberto, setSuccessModalAberto,
    clearDraft, handleSelectType, handleNextStep, handleNextOperationalStep, handleFinalSubmit, submitToApi,
    isCheckingEmail, isCheckingDocumento, isLookingUpCnpj, isLookingUpCep, isCheckingPhone, isLookingUpPix,
    cnpjMeta, cnpjAutoFilledAddress, cepGeoVerified, pixLookupResult, setPixLookupResult, sameWhatsappAsPhone, setSameWhatsappAsPhone, kycSession,
    handleEmailBlur, handleDocumentoChange, handleDocumentoBlur, handleCepChange, handleCepLookup, handlePhoneBlur, handlePixKeyLookup,
    files,
  } = useRegisterForm();
  const { register, control, formState: { errors }, setValue, clearErrors, trigger } = form;
  const watchedPassword = useWatch({ control, name: "senha", defaultValue: "" }) || "";
  const watchedCnpj = useWatch({ control, name: "documento", defaultValue: "" }) || "";
  const watchedCep = useWatch({ control, name: "cep", defaultValue: "" }) || "";
  const watchedPixKey = useWatch({ control, name: "pixKey", defaultValue: "" }) || "";
  const passwordChecks = getPasswordChecks(watchedPassword, accountType);

  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    if (!contentRef.current || isChecking) return;

    gsap.killTweensOf(contentRef.current);
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", clearProps: "all" }
    );
  }, [step, isChecking]);

  if (isChecking) return <div className="min-h-[100dvh] w-full bg-[#F9FAFB] lg:bg-white"></div>;

  return (
    <div className="flex h-[100dvh] w-full font-sans selection:bg-[#6B39A7] selection:text-white bg-[#F9FAFB] lg:bg-white overflow-hidden relative">
      <Toaster position="top-center" />
      <TermosModal isOpen={modalAberto} onConfirm={submitToApi} onCancel={() => setModalAberto(false)} isLoading={isPending} />

      {/* MODAL DE SUCESSO FINTECH */}
      <AnimatePresence>
        {successModalAberto && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={() => { }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-100 flex flex-col items-center text-center"
            >
              {/* Ícone Fintech Amplo */}
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 border border-emerald-100 shadow-sm">
                <CheckCircle2 size={44} strokeWidth={2.4} />
              </div>

              <h2 className="text-3xl sm:text-[32px] font-extrabold text-gray-900 tracking-tight mb-3">
                {accountType === "ong" ? "Cadastro enviado!" : "Conta criada com sucesso!"}
              </h2>

              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-8 px-2 font-medium">
                {accountType === "ong" ? (
                  <>
                    Recebemos seus dados e documentos. Nossa equipe de <strong className="text-gray-900 font-bold">Compliance</strong> já iniciou a análise. Acesse sua conta para acompanhar o status em tempo real.
                  </>
                ) : (
                  <>
                    Sua conta no DoeCerto está pronta. Acesse agora para acompanhar campanhas e iniciar suas doações.
                  </>
                )}
              </p>

              <button
                onClick={() => window.location.replace("/login")}
                className="w-full py-4 px-6 bg-[#6B39A7] hover:bg-[#5b2f8e] text-white rounded-xl font-bold text-lg sm:text-xl transition-all active:scale-[0.98] shadow-md shadow-purple-600/20 cursor-pointer"
              >
                Fazer Login agora
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COLUNA ESQUERDA */}
      <div ref={scrollRef} className="w-full lg:w-1/2 h-full overflow-y-auto flex flex-col items-center px-6 sm:px-12 py-10 sm:py-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div ref={contentRef} className={`w-full max-w-[460px] shrink-0 ${step === 1 ? 'my-auto' : 'pb-12'}`}>

          {/* STEP 1 */}
          {step === 1 && (
            <AccountTypeSelection onSelect={handleSelectType} />
          )}

          {/* BARRA DE PROGRESSO ONG (STEPS 2 a 4) */}
          {accountType === 'ong' && step >= 2 && step <= 4 && (
            <div className="mb-6 flex items-center gap-2 text-xs font-bold">
              {[
                { id: 2, label: "1. Acesso e CNPJ" },
                { id: 3, label: "2. Endereço e Pix" },
                { id: 4, label: "3. Documentos" },
              ].map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex-1 py-2 px-2.5 rounded-xl text-center transition-all border ${
                      step === s.id
                        ? "bg-[#6B39A7] text-white border-[#6B39A7] shadow-sm"
                        : step > s.id
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    {s.label}
                  </div>
                  {idx < 2 && <div className="w-2 h-0.5 bg-gray-200 shrink-0 hidden sm:block" />}
                </div>
              ))}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <button type="button" onClick={() => { clearDraft(); }} className="flex items-center text-gray-500 hover:text-[#6B39A7] font-semibold mb-6 transition-colors group w-fit cursor-pointer">
                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Trocar perfil
              </button>
              <div className="mb-8 text-left">
                <h1 className="text-4xl sm:text-[2.5rem] font-bold text-gray-900 mb-2 leading-tight">
                  {accountType === 'ong' ? 'Identidade e acesso da ONG' : 'Criar conta de Doador'}
                </h1>
                <p className="text-gray-500 text-lg font-medium leading-relaxed">
                  {accountType === 'ong'
                    ? 'Digite o CNPJ da instituição para preenchermos os dados oficiais automaticamente.'
                    : 'Preencha seus dados básicos para começar a doar com segurança.'}
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="flex flex-col gap-5">

                <InputField
                  label={accountType === 'ong' ? 'CNPJ da instituição' : 'CPF'} icon={IdCard}
                  placeholder={accountType === 'ong' ? "00.000.000/0000-00" : "000.000.000-00"}
                  maxLength={accountType === 'ong' ? 18 : 14}
                  isLoading={isCheckingDocumento || isLookingUpCnpj}
                  {...register("documento")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleDocumentoChange(e.target.value);
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    register("documento").onBlur(e);
                    handleDocumentoBlur(e.target.value);
                  }}
                  error={errors.documento?.message}
                />

                {accountType === 'ong' && isLookingUpCnpj && (
                  <p className="-mt-3 text-xs font-semibold text-[#6B39A7] flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin" />
                    Consultando situação cadastral e endereço oficial na Receita Federal...
                  </p>
                )}

                {accountType === 'ong' && !isLookingUpCnpj && cnpjMeta?.found && (
                  <div className={`-mt-2 p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${cnpjMeta.isAtiva ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-amber-50 border-amber-200 text-amber-900"}`}>
                    <Sparkles size={16} className={`shrink-0 mt-0.5 ${cnpjMeta.isAtiva ? "text-emerald-600" : "text-amber-600"}`} />
                    <div>
                      <p className="font-bold">
                        Receita Federal: {cnpjMeta.situacaoCadastral || (cnpjMeta.isAtiva ? "ATIVA" : "Situação pendente")}
                        {cnpjMeta.yearsOfOperation !== null && ` • ${cnpjMeta.yearsOfOperation} ${cnpjMeta.yearsOfOperation === 1 ? "ano" : "anos"} de atuação`}
                      </p>
                      <p className="opacity-85 mt-0.5 leading-relaxed">
                        {cnpjMeta.isAtiva
                          ? "Razão social e endereço atualizados pelo CNPJ."
                          : "Pendências fiscais podem impedir a abertura da subconta financeira."}
                        {cnpjMeta.foundedAt && ` Abertura oficial: ${cnpjMeta.foundedAt.split("-").reverse().join("/")}.`}
                      </p>
                    </div>
                  </div>
                )}

                <InputField
                  label={accountType === 'ong' ? 'Razão Social ou Nome da ONG' : 'Nome completo'}
                  icon={User}
                  placeholder={accountType === 'ong' ? "Ex.: Instituto Esperança Solidária" : "Digite seu nome completo"}
                  {...register("nome")}
                  onChange={(e: any) => { register("nome").onChange(e); clearErrors("nome"); }}
                  onBlur={(e: any) => { register("nome").onBlur(e); if (e.target.value.trim() !== "") trigger("nome"); }}
                  error={errors.nome?.message}
                />

                <InputField
                  label={accountType === 'ong' ? 'E-mail institucional' : 'E-mail'}
                  icon={Mail}
                  type="email"
                  placeholder={accountType === 'ong' ? "contato@suaong.org.br" : "voce@email.com"}
                  isLoading={isCheckingEmail}
                  {...register("email")}
                  onChange={(e: any) => { register("email").onChange(e); clearErrors("email"); }}
                  onBlur={(e: any) => {
                    register("email").onBlur(e);
                    handleEmailBlur(e.target.value);
                  }}
                  error={errors.email?.message}
                />

                <InputField
                  label="Crie uma senha" icon={Lock} type="password" placeholder={accountType === "ong" ? "Mínimo de 10 caracteres" : "Mínimo de 8 caracteres"}
                  {...register("senha")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { register("senha").onChange(e); clearErrors("senha"); }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => { register("senha").onBlur(e); if (e.target.value.trim() !== "") trigger("senha"); }}
                  error={errors.senha?.message}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 -mt-2 px-1">
                  {passwordChecks.map((check) => (
                    <div
                      key={check.key}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        check.met ? "text-emerald-600" : "text-gray-500"
                      }`}
                    >
                      <CheckCircle2
                        size={14}
                        className={check.met ? "text-emerald-600 shrink-0" : "text-gray-300 shrink-0"}
                      />
                      <span>{check.label}</span>
                    </div>
                  ))}
                </div>

                <InputField
                  label="Confirmar senha" icon={Lock} type="password" placeholder="Digite a senha novamente"
                  {...register("confirmarSenha")}
                  onChange={(e: any) => { register("confirmarSenha").onChange(e); clearErrors("confirmarSenha"); }}
                  onBlur={(e: any) => { register("confirmarSenha").onBlur(e); if (e.target.value.trim() !== "") trigger("confirmarSenha"); }}
                  error={errors.confirmarSenha?.message}
                />

                <button type="submit" disabled={isPending || isLookingUpCnpj} className="w-full flex justify-center items-center gap-2 h-[60px] mt-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-lg rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60">
                  {isPending || isLookingUpCnpj ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {isLookingUpCnpj ? "Consultando CNPJ..." : "Validando dados..."}
                    </>
                  ) : accountType === 'ong' ? (
                    <>
                      Continuar para Endereço e Pix <ArrowRight size={20} />
                    </>
                  ) : (
                    "Revisar Termos e Concluir"
                  )}
                </button>
              </form>
            </>
          )}

          {/* STEP 3 (Apenas ONG: Endereço com CEP + Contato + Chave Pix DICT) */}
          {step === 3 && accountType === 'ong' && (
            <>
              <button type="button" onClick={() => setStep(2)} className="flex items-center text-gray-500 hover:text-[#6B39A7] font-semibold mb-6 transition-colors group w-fit cursor-pointer">
                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar para Acesso e CNPJ
              </button>

              <div className="mb-7 text-left">
                <h1 className="text-3xl sm:text-[2.3rem] font-bold text-gray-900 mb-2 leading-tight">Endereço, Contato e Pix</h1>
                <p className="text-gray-500 text-base font-medium leading-relaxed">
                  Esses dados posicionam sua ONG no mapa por proximidade e habilitam repasses financeiros seguros.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleNextOperationalStep(); }} className="flex flex-col gap-5">
                {/* CEP + Endereço */}
                <div className="p-5 bg-gray-50/80 border border-gray-200 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                      <MapPin size={16} className="text-[#6B39A7]" /> Endereço da Sede
                    </h3>
                    {cepGeoVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 size={12} /> Mapa e CEP verificados
                      </span>
                    )}
                  </div>

                  {cnpjAutoFilledAddress && (
                    <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 font-medium leading-relaxed">
                      Endereço preenchido automaticamente a partir do CNPJ informado. Confira o número ou edite caso a sede funcione em outro local.
                    </div>
                  )}

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <InputField
                        label="CEP" icon={MapPin} placeholder="00000-000" maxLength={9}
                        isLoading={isLookingUpCep}
                        {...register("cep")}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleCepChange(e.target.value);
                        }}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                          register("cep").onBlur(e);
                          handleCepLookup(e.target.value);
                        }}
                        error={errors.cep?.message}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCepLookup(watchedCep, true)}
                      disabled={isLookingUpCep || removeFormatting(watchedCep).length !== 8}
                      className="h-[58px] px-4 rounded-xl bg-white border border-gray-200 hover:border-[#6B39A7] text-[#6B39A7] font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Atualizar CEP
                    </button>
                  </div>

                  <InputField
                    label="Logradouro (Rua / Av.)" icon={MapPin} placeholder="Av. Paulista"
                    {...register("rua")}
                    onChange={(e: any) => { register("rua").onChange(e); clearErrors("rua"); }}
                    error={errors.rua?.message}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Número" icon={Building2} placeholder="Ex.: 1000 ou S/N"
                      {...register("numero")}
                      onChange={(e: any) => { register("numero").onChange(e); clearErrors("numero"); }}
                      error={errors.numero?.message}
                    />
                    <InputField
                      label="Complemento (opcional)" icon={Building2} placeholder="Sala, bloco, andar"
                      {...register("complemento")}
                      onChange={(e: any) => { register("complemento").onChange(e); }}
                      error={errors.complemento?.message}
                    />
                  </div>

                  <InputField
                    label="Bairro" icon={MapPin} placeholder="Bela Vista"
                    {...register("bairro")}
                    onChange={(e: any) => { register("bairro").onChange(e); clearErrors("bairro"); }}
                    error={errors.bairro?.message}
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <InputField
                        label="Cidade" icon={MapPin} placeholder="São Paulo"
                        {...register("cidade")}
                        onChange={(e: any) => { register("cidade").onChange(e); clearErrors("cidade"); }}
                        error={errors.cidade?.message}
                      />
                    </div>
                    <InputField
                      label="UF" icon={MapPin} placeholder="SP" maxLength={2}
                      {...register("uf")}
                      onChange={(e: any) => {
                        setValue("uf", e.target.value.toUpperCase().replace(/[^A-Z]/g, ""));
                        clearErrors("uf");
                      }}
                      error={errors.uf?.message}
                    />
                  </div>
                </div>

                {/* Contatos */}
                <div className="p-5 bg-gray-50/80 border border-gray-200 rounded-2xl flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                      <Phone size={16} className="text-[#6B39A7]" /> Contatos Oficiais
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Usado na abertura da conta de repasse e para doadores falarem com sua equipe.
                    </p>
                  </div>

                  <InputField
                    label="Telefone principal (com DDD)" icon={Phone} placeholder="(11) 99999-9999" maxLength={15}
                    isLoading={isCheckingPhone}
                    {...register("telefone")}
                    onChange={(e: any) => {
                      setValue("telefone", formatBrazilianPhone(e.target.value));
                      clearErrors("telefone");
                    }}
                    onBlur={(e: any) => {
                      register("telefone").onBlur(e);
                      handlePhoneBlur(e.target.value);
                    }}
                    error={errors.telefone?.message}
                  />

                  <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sameWhatsappAsPhone}
                      onChange={(e) => setSameWhatsappAsPhone(e.target.checked)}
                      className="w-4 h-4 accent-[#6B39A7] rounded"
                    />
                    Usar este mesmo número como WhatsApp público no perfil
                  </label>

                  {!sameWhatsappAsPhone && (
                    <InputField
                      label="WhatsApp de Atendimento" icon={MessageCircle} placeholder="(11) 99999-9999" maxLength={15}
                      {...register("whatsapp")}
                      onChange={(e: any) => {
                        setValue("whatsapp", formatBrazilianPhone(e.target.value));
                        clearErrors("whatsapp");
                      }}
                      error={errors.whatsapp?.message}
                    />
                  )}
                </div>

                {/* Chave Pix DICT */}
                <div className="p-5 bg-purple-50/50 border border-purple-200 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                      <KeyRound size={16} className="text-[#6B39A7]" /> Chave Pix para Repasses
                    </h3>
                    {watchedCnpj && (
                      <button
                        type="button"
                        onClick={() => {
                          setValue("pixKey", watchedCnpj);
                          clearErrors("pixKey");
                          handlePixKeyLookup(watchedCnpj);
                        }}
                        className="text-xs font-bold text-[#6B39A7] bg-white border border-purple-200 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Preencher com CNPJ da ONG
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 font-medium leading-relaxed -mt-2">
                    Informe a chave Pix vinculada à conta da instituição (CNPJ, e-mail, telefone ou chave aleatória). Para segurança financeira, <strong>chaves de CPF pessoal não são aceitas</strong>.
                  </p>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <InputField
                        label="" icon={KeyRound} placeholder="CNPJ, e-mail, telefone ou chave aleatória"
                        isLoading={isLookingUpPix}
                        {...register("pixKey")}
                        onChange={(e: any) => {
                          register("pixKey").onChange(e);
                          clearErrors("pixKey");
                          setPixLookupResult(null);
                        }}
                        onBlur={(e: any) => {
                          register("pixKey").onBlur(e);
                          if (e.target.value.trim()) handlePixKeyLookup(e.target.value);
                        }}
                        error={errors.pixKey?.message}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePixKeyLookup()}
                      disabled={isLookingUpPix || !watchedPixKey.trim()}
                      className="h-[58px] px-4 rounded-xl bg-white border border-purple-200 hover:border-[#6B39A7] text-[#6B39A7] font-bold text-sm transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      Verificar chave
                    </button>
                  </div>

                  {pixLookupResult?.found && (
                    <div className="p-4 rounded-xl bg-white border border-emerald-200 flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between text-emerald-700 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Landmark size={15} /> Conta Bancária Localizada
                        </span>
                        <span className="uppercase">{pixLookupResult.keyType}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-gray-700">
                        <div><span className="text-gray-400">Banco:</span> <strong>{pixLookupResult.bankName || "—"} {pixLookupResult.bankCode ? `(${pixLookupResult.bankCode})` : ""}</strong></div>
                        <div><span className="text-gray-400">Tipo:</span> <strong>{pixLookupResult.accountType || "—"}</strong></div>
                        <div><span className="text-gray-400">Agência:</span> <strong>{pixLookupResult.agencyNumber || "—"}</strong></div>
                        <div><span className="text-gray-400">Conta:</span> <strong>{pixLookupResult.accountNumber || "—"}</strong></div>
                      </div>
                      {pixLookupResult.ownerName && (
                        <div className="text-gray-600 pt-1 border-t border-gray-100">
                          Titular: <strong>{pixLookupResult.ownerName}</strong>
                        </div>
                      )}
                      {pixLookupResult.ownerMatchesCnpj === false && (
                        <div className="mt-1 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold flex items-center gap-1.5">
                          <AlertTriangle size={14} className="shrink-0" />
                          Atenção: a titularidade desta chave diverge do CNPJ cadastrado. Recomendamos chave vinculada ao CNPJ da ONG.
                        </div>
                      )}
                    </div>
                  )}

                  {pixLookupResult && !pixLookupResult.found && pixLookupResult.validFormat && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 size={15} className="shrink-0" />
                      <span>
                        Chave Pix ({pixLookupResult.keyType}) validada ({pixLookupResult.maskedPixKey}). Os dados bancários são sincronizados automaticamente após a ativação da conta.
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLookingUpPix || isLookingUpCep}
                  className="w-full flex justify-center items-center gap-2 h-[60px] mt-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-lg rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
                >
                  Continuar para Documentos <ArrowRight size={20} />
                </button>
              </form>
            </>
          )}

          {/* STEP 4 (Apenas ONG: Documentação Legal & Representante) */}
          {step === 4 && accountType === 'ong' && (
            <>
              <button type="button" onClick={() => setStep(3)} className="flex items-center text-gray-500 hover:text-[#6B39A7] font-semibold mb-6 transition-colors group w-fit cursor-pointer">
                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar para Endereço e Pix
              </button>

              <div className="mb-8 text-left">
                <h1 className="text-4xl sm:text-[2.5rem] font-bold text-gray-900 mb-2 leading-tight">Responsável e Documentos</h1>
                <p className="text-gray-500 text-lg font-medium leading-relaxed">
                  Identifique quem assina pela ONG e anexe os documentos oficiais para nossa análise de segurança.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(); }} className="flex flex-col gap-8">
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col gap-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-800 uppercase tracking-wider">Representante Legal (Presidente / Diretor)</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                      Deve constar na Ata ou Estatuto — será a pessoa que fará a selfie com documento na etapa seguinte.
                    </p>
                  </div>

                  <InputField
                    label="Nome completo do representante" icon={User} placeholder="Nome completo conforme o RG/CNH"
                    {...register("nomePresidente")}
                    onChange={(e: any) => { register("nomePresidente").onChange(e); clearErrors("nomePresidente"); }}
                    onBlur={(e: any) => { register("nomePresidente").onBlur(e); if (e.target.value.trim() !== "") trigger("nomePresidente"); }}
                    error={errors.nomePresidente?.message}
                  />

                  <InputField
                    label="CPF do representante" icon={IdCard} maxLength={14} placeholder="000.000.000-00"
                    {...register("cpfPresidente")}
                    onChange={(e: any) => {
                      setValue("cpfPresidente", formatCPF(e.target.value));
                      clearErrors("cpfPresidente");
                    }}
                    onBlur={(e: any) => { register("cpfPresidente").onBlur(e); if (e.target.value.trim() !== "") trigger("cpfPresidente"); }}
                    error={errors.cpfPresidente?.message}
                  />
                </div>

                <div className="flex flex-col gap-6">
                  <FileDropzone title="Estatuto Social" subtitle="Clique ou arraste o estatuto vigente registrado" file={files.fileEstatuto} setFile={files.setFileEstatuto} />
                  <FileDropzone title="Ata de Constituição ou Eleição" subtitle="Ata mais recente que comprova o presidente atual" file={files.fileAta} setFile={files.setFileAta} />
                  <FileDropzone title="Cartão CNPJ" subtitle="Comprovante oficial emitido pela Receita Federal" file={files.fileCartaoCnpj} setFile={files.setFileCartaoCnpj} />
                </div>

                <button type="submit" disabled={isPending} className="w-full h-[60px] mt-2 bg-[#4A2675] hover:bg-[#3b1a66] text-white font-bold text-lg rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60">
                  Revisar Termos e Enviar Cadastro
                </button>
              </form>
            </>
          )}

          {/* STEP 5 (Pós-Cadastro Big-Enterprise: QR Code de Selfie Asaas + Acompanhamento KYC) */}
          {step === 5 && kycSession && (
            <OngKycSelfieStep
              ongName={kycSession.ongName}
              email={kycSession.email}
              onboardingKycToken={kycSession.onboardingKycToken}
              initialOnboarding={kycSession.initialOnboarding}
            />
          )}

          {/* RODAPÉ UNIFICADO */}
          {step < 5 && (
            <div className="text-center mt-8 border-t border-gray-100 pt-6">
              <span className="text-lg text-gray-500 font-medium">Já tem uma conta? </span>
              <Link href="/login" onClick={clearDraft} className="text-lg font-bold text-[#6B39A7] hover:text-purple-800 transition-colors">
                Entrar
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* COLUNA DIREITA */}
      <div className="hidden lg:block w-1/2 h-full relative bg-transparent">
        <div className="absolute inset-y-0 right-0 left-0 rounded-l-[3.5rem] overflow-hidden shadow-[-20px_0_40px_rgba(0,0,0,0.05)]">
          <Image src="/fotocrianca1.png" alt="Criança Sorrindo" fill priority className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4A2675]/30 via-transparent to-transparent mix-blend-multiply"></div>
        </div>
      </div>
    </div>
  );
}