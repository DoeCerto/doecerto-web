"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, forwardRef, InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeClosed, Lock, Mail, User, Building2, ArrowLeft, FileText, IdCard, UploadCloud, CheckCircle, X, LucideIcon, Phone } from "lucide-react";
import gsap from "gsap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Importações dos serviços
import { registerOng } from "@/services/register-ong.service";
import { registerDonor } from "@/services/register.service"; 
import { formatCNPJ, removeFormatting, validateCNPJ, formatCPF, validateCPF } from "@/utils/documentValidation";
import TermosModal from "@/components/shared/TermosModal";

// ==========================================
// FUNÇÕES DE TELEFONE (Máscara e Validação)
// ==========================================
const formatPhone = (value: string) => {
  if (!value) return "";
  const p = value.replace(/\D/g, "");
  if (p.length <= 2) return `(${p}`;
  if (p.length <= 6) return `(${p.slice(0, 2)}) ${p.slice(2)}`;
  if (p.length <= 10) return `(${p.slice(0, 2)}) ${p.slice(2, 6)}-${p.slice(6)}`;
  return `(${p.slice(0, 2)}) ${p.slice(2, 7)}-${p.slice(7, 11)}`;
};

const validatePhone = (value: string) => {
  const p = value.replace(/\D/g, "");
  // Aceita fixo (10 dígitos) ou celular (11 dígitos)
  return p.length === 10 || p.length === 11;
};


// ==========================================
// 1. TIPAGENS E SCHEMAS
// ==========================================
type AccountType = "donor" | "ong" | null;

const registerSchema = z.object({
  accountType: z.enum(["donor", "ong"]).nullable(),
  nome: z.string().min(3, "Mínimo de 3 caracteres").regex(/^[^0-9]*$/, "Não pode conter números"),
  email: z.string().min(1, "O e-mail é obrigatório").email("E-mail inválido"),
  contactNumber: z.string().min(1, "O telefone é obrigatório"), // <-- Novo campo adicionado aqui
  senha: z.string().min(8, "Mínimo de 8 caracteres"),
  confirmarSenha: z.string().min(1, "Confirme sua senha"),
  documento: z.string().min(1, "Documento é obrigatório"),
  nomePresidente: z.string().optional(),
  cpfPresidente: z.string().optional(),
}).superRefine((data, ctx) => {
  
  // Validação de Senha
  if (data.senha !== data.confirmarSenha) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "As senhas não coincidem", path: ["confirmarSenha"] });
  }
  
  // Validação de Telefone <-- Nova Validação
  if (!validatePhone(data.contactNumber)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Telefone inválido", path: ["contactNumber"] });
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
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, icon: Icon, error, type = "text", ...props }, ref) => {
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
            className={`w-full bg-white border text-gray-900 rounded-xl pl-12 ${isPassword ? 'pr-12' : 'pr-4'} py-4 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-lg font-medium shadow-sm ${error ? "border-red-400 focus:border-red-500 ring-red-100 ring-2 animate-[shake_0.5s_ease-in-out]" : "border-gray-200 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7]"}`}
            {...props}
          />
          {isPassword && (
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
        {error && <span className="text-red-500 text-sm font-bold mt-1">{error}</span>}
      </div>
    );
  }
);
InputField.displayName = "InputField";

// --- Step 1: Seleção de Perfil ---
function AccountTypeSelection({ onSelect }: { onSelect: (type: AccountType) => void }) {
  const options = [
    { type: "donor", icon: User, title: "Sou um Doador", desc: "Quero encontrar campanhas e ajudar causas sociais." },
    { type: "ong", icon: Building2, title: "Sou uma ONG", desc: "Quero cadastrar minha instituição e receber doações." }
  ];

  return (
    <>
      <div className="mb-10 text-left">
        <h1 className="text-4xl sm:text-[3rem] font-bold text-gray-900 mb-2 tracking-tight leading-tight">Junte-se a nós!</h1>
        <p className="text-gray-500 text-lg font-medium">Como você deseja usar o DoeCerto?</p>
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
          toast.success(`${title} processado!`);
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
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) processFile(f); }}
        className={`relative w-full h-[200px] rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 overflow-hidden ${
          uploadState === 'idle'
            ? isDragging ? "border-2 border-dashed border-[#6B39A7] bg-purple-100/60 scale-[1.02] shadow-lg shadow-purple-500/10" : "border-2 border-dashed border-gray-300 hover:border-[#6B39A7] bg-gray-50/70 hover:bg-purple-50/30"
            : "border border-gray-200 bg-white shadow-sm"
        }`}
      >
        {uploadState === 'idle' && (
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={(e) => { const f = e.target.files?.[0]; if(f) processFile(f); }} accept=".pdf,.png,.jpg,.jpeg" />
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [fileEstatuto, setFileEstatuto] = useState<File | null>(null);
  const [fileAta, setFileAta] = useState<File | null>(null);
  const [fileCartaoCnpj, setFileCartaoCnpj] = useState<File | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      accountType: null, 
      nome: "", 
      email: "", 
      contactNumber: "", // <-- Valor inicial para o telefone
      senha: "", 
      confirmarSenha: "", 
      documento: "", 
      nomePresidente: "", 
      cpfPresidente: "" 
    }
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      router.replace("/home");
      return;
    }
    const draft = sessionStorage.getItem("register_draft");
    if (draft) {
      const parsed = JSON.parse(draft);
      form.reset(parsed.formData);
      setStep(parsed.step || 1);
      setAccountType(parsed.accountType || null);
    } else {
      setStep(1);
      setAccountType(null);
      form.reset();
    }
    setIsChecking(false);
  }, [router, form]);

  useEffect(() => {
    if (isChecking) return;
    const subscription = form.watch((value) => {
      sessionStorage.setItem("register_draft", JSON.stringify({ step, accountType, formData: value }));
    });
    return () => subscription.unsubscribe();
  }, [form.watch, step, accountType, isChecking]);

  const clearDraft = () => {
    setStep(1);
    setAccountType(null);
    form.reset({
      accountType: null, nome: "", email: "", contactNumber: "", senha: "", confirmarSenha: "", documento: "", nomePresidente: "", cpfPresidente: ""
    });
    setFileEstatuto(null); setFileAta(null); setFileCartaoCnpj(null);
    setTimeout(() => { sessionStorage.removeItem("register_draft"); }, 50);
  };

  const handleSelectType = (type: AccountType) => {
    setAccountType(type);
    form.setValue("accountType", type);
    setStep(2);
  };

  const handleNextStep = async () => {
    // Adicionamos contactNumber nos gatilhos de validação
    const isValid = await form.trigger(["nome", "email", "contactNumber", "senha", "confirmarSenha", "documento"]);
    if (isValid) {
      if (accountType === "ong") setStep(3);
      else setModalAberto(true);
    } else {
      toast.error("Corrija os campos em vermelho.");
    }
  };

  const handleFinalSubmit = async () => {
    const isValid = await form.trigger(["nomePresidente", "cpfPresidente"]);
    if (!isValid) return;

    if (!fileEstatuto || !fileAta || !fileCartaoCnpj) {
      toast.error("Por favor, anexe os 3 documentos obrigatórios.");
      return;
    }
    setModalAberto(true);
  };

  const submitToApi = async () => {
    setIsPending(true);
    try {
      const data = form.getValues();
      if (data.accountType === 'ong') {
        await registerOng({ 
          name: data.nome, 
          email: data.email, 
          password: data.senha, 
          cnpj: removeFormatting(data.documento),
          contactNumber: removeFormatting(data.contactNumber) // <- Enviando pro back sem formatação
        });
        toast.success("Documentação enviada para análise!");
      } else {
        await registerDonor({ 
          name: data.nome, 
          email: data.email, 
          password: data.senha, 
          cpf: removeFormatting(data.documento),
          contactNumber: removeFormatting(data.contactNumber) // <- Enviando pro back sem formatação
        });
        toast.success("Doador cadastrado com sucesso!");
      }
      clearDraft();
      setModalAberto(false);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      toast.error("Ocorreu um erro no cadastro. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  };

  return {
    form, step, setStep, accountType, isChecking, modalAberto, setModalAberto, isPending, clearDraft, handleSelectType, handleNextStep, handleFinalSubmit, submitToApi,
    files: { fileEstatuto, setFileEstatuto, fileAta, setFileAta, fileCartaoCnpj, setFileCartaoCnpj }
  };
}

// ==========================================
// 4. TELA PRINCIPAL (O Componente Register)
// ==========================================
export default function Register() {
  const { form, step, setStep, accountType, isChecking, modalAberto, setModalAberto, isPending, clearDraft, handleSelectType, handleNextStep, handleFinalSubmit, submitToApi, files } = useRegisterForm();
  const { register, formState: { errors }, setValue, clearErrors, trigger } = form;
  
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
    <div className="flex h-[100dvh] w-full font-sans selection:bg-[#6B39A7] selection:text-white bg-[#F9FAFB] lg:bg-white overflow-hidden">
      <Toaster position="top-center" />
      <TermosModal isOpen={modalAberto} onConfirm={submitToApi} onCancel={() => setModalAberto(false)} isLoading={isPending} />

      {/* COLUNA ESQUERDA */}
      <div ref={scrollRef} className="w-full lg:w-1/2 h-full overflow-y-auto flex flex-col items-center px-6 sm:px-12 py-10 sm:py-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div ref={contentRef} className={`w-full max-w-[460px] shrink-0 ${step === 1 ? 'my-auto' : 'pb-12'}`}>
          
          {/* STEP 1 */}
          {step === 1 && (
            <AccountTypeSelection onSelect={handleSelectType} />
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <button type="button" onClick={() => { clearDraft(); }} className="flex items-center text-gray-500 hover:text-[#6B39A7] font-semibold mb-6 transition-colors group w-fit">
                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar
              </button>
              <div className="mb-8 text-left">
                <h1 className="text-4xl sm:text-[2.5rem] font-bold text-gray-900 mb-2 leading-tight">
                  {accountType === 'ong' ? 'Dados da ONG' : 'Criar conta Doador'}
                </h1>
                <p className="text-gray-500 text-lg font-medium">Preencha os dados abaixo para começar.</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="flex flex-col gap-5">
                
                <InputField 
                  label={accountType === 'ong' ? 'Razão Social / Nome' : 'Nome Completo'} 
                  icon={User} placeholder="Digite aqui" 
                  {...register("nome")}
                  onChange={(e: any) => { register("nome").onChange(e); clearErrors("nome"); }}
                  onBlur={(e: any) => { register("nome").onBlur(e); if(e.target.value.trim() !== "") trigger("nome"); }}
                  error={errors.nome?.message} 
                />
                
                <InputField 
                  label={accountType === 'ong' ? 'CNPJ' : 'CPF'} icon={IdCard} 
                  placeholder={accountType === 'ong' ? "00.000.000/0000-00" : "000.000.000-00"} 
                  maxLength={accountType === 'ong' ? 18 : 14}
                  {...register("documento")} 
                  onChange={(e: any) => {
                    const val = accountType === 'ong' ? formatCNPJ(e.target.value) : formatCPF(e.target.value);
                    setValue("documento", val);
                    clearErrors("documento");
                  }}
                  onBlur={(e: any) => { register("documento").onBlur(e); if(e.target.value.trim() !== "") trigger("documento"); }}
                  error={errors.documento?.message} 
                />

                <InputField 
                  label="Endereço de Email" icon={Mail} type="email" placeholder="exemplo@email.com" 
                  {...register("email")} 
                  onChange={(e: any) => { register("email").onChange(e); clearErrors("email"); }}
                  onBlur={(e: any) => { register("email").onBlur(e); if(e.target.value.trim() !== "") trigger("email"); }}
                  error={errors.email?.message} 
                />

                {/* NOVO CAMPO: TELEFONE */}
                <InputField 
                  label="Telefone" icon={Phone} placeholder="(00) 00000-0000" 
                  maxLength={15}
                  {...register("contactNumber")} 
                  onChange={(e: any) => { 
                    const val = formatPhone(e.target.value);
                    setValue("contactNumber", val); 
                    clearErrors("contactNumber"); 
                  }}
                  onBlur={(e: any) => { register("contactNumber").onBlur(e); if(e.target.value.trim() !== "") trigger("contactNumber"); }}
                  error={errors.contactNumber?.message} 
                />
                
                <InputField 
                  label="Senha" icon={Lock} type="password" placeholder="Mínimo de 8 caracteres" 
                  {...register("senha")} 
                  onChange={(e: any) => { register("senha").onChange(e); clearErrors("senha"); }}
                  onBlur={(e: any) => { register("senha").onBlur(e); if(e.target.value.trim() !== "") trigger("senha"); }}
                  error={errors.senha?.message} 
                />
                
                <InputField 
                  label="Confirmar Senha" icon={Lock} type="password" placeholder="Repita sua senha" 
                  {...register("confirmarSenha")} 
                  onChange={(e: any) => { register("confirmarSenha").onChange(e); clearErrors("confirmarSenha"); }}
                  onBlur={(e: any) => { register("confirmarSenha").onBlur(e); if(e.target.value.trim() !== "") trigger("confirmarSenha"); }}
                  error={errors.confirmarSenha?.message} 
                />

                <button type="submit" className="w-full flex justify-center items-center h-[60px] mt-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-lg rounded-xl shadow-md active:scale-[0.98] transition-all">
                  {accountType === 'ong' ? "Avançar para Documentação" : "Continuar e Ler Termos"}
                </button>
              </form>
            </>
          )}

          {/* STEP 3 (Apenas ONG) */}
          {step === 3 && accountType === 'ong' && (
            <>
              <button type="button" onClick={() => setStep(2)} className="flex items-center text-gray-500 hover:text-[#6B39A7] font-semibold mb-6 transition-colors group w-fit">
                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar
              </button>

              <div className="mb-8 text-left">
                <h1 className="text-4xl sm:text-[2.5rem] font-bold text-gray-900 mb-2 leading-tight">Documentação Legal</h1>
                <p className="text-gray-500 text-lg font-medium leading-relaxed">Validação dos documentos do representante e instituição.</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(); }} className="flex flex-col gap-8">
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col gap-5">
                  <h3 className="text-base font-bold text-gray-800 uppercase tracking-wider">Representante</h3>
                  
                  <InputField 
                    label="" icon={User} placeholder="Nome do Presidente" 
                    {...register("nomePresidente")} 
                    onChange={(e: any) => { register("nomePresidente").onChange(e); clearErrors("nomePresidente"); }}
                    onBlur={(e: any) => { register("nomePresidente").onBlur(e); if(e.target.value.trim() !== "") trigger("nomePresidente"); }}
                    error={errors.nomePresidente?.message} 
                  />
                  
                  <InputField 
                    label="" icon={IdCard} maxLength={14} placeholder="CPF do Presidente" 
                    {...register("cpfPresidente")} 
                    onChange={(e: any) => {
                      setValue("cpfPresidente", formatCPF(e.target.value));
                      clearErrors("cpfPresidente");
                    }}
                    onBlur={(e: any) => { register("cpfPresidente").onBlur(e); if(e.target.value.trim() !== "") trigger("cpfPresidente"); }}
                    error={errors.cpfPresidente?.message} 
                  />
                </div>

                <div className="flex flex-col gap-6">
                  <FileDropzone title="Estatuto Social" subtitle="Arraste ou clique" file={files.fileEstatuto} setFile={files.setFileEstatuto} />
                  <FileDropzone title="Ata de Constituição" subtitle="Arraste ou clique" file={files.fileAta} setFile={files.setFileAta} />
                  <FileDropzone title="Cartão CNPJ" subtitle="Arraste ou clique" file={files.fileCartaoCnpj} setFile={files.setFileCartaoCnpj} />
                </div>

                <button type="submit" className="w-full h-[60px] mt-2 bg-[#4A2675] hover:bg-[#3b1a66] text-white font-bold text-lg rounded-xl shadow-md active:scale-[0.98] transition-all">
                  Finalizar Cadastro
                </button>
              </form>
            </>
          )}

          {/* RODAPÉ UNIFICADO */}
          <div className="text-center mt-8 border-t border-gray-100 pt-6">
            <span className="text-lg text-gray-500 font-medium">Já tem uma conta? </span>
            <Link href="/login" onClick={clearDraft} className="text-lg font-bold text-[#6B39A7] hover:text-purple-800 transition-colors">
              Entrar
            </Link>
          </div>

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