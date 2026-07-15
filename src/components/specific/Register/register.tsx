"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, User, Building2, ArrowLeft, AlertCircle, FileText, IdCard } from "lucide-react";
import gsap from "gsap";

// Importações dos serviços 
import { registerOng } from "@/services/register-ong.service";
import { registerDonor } from "@/services/register.service"; 
import { formatCNPJ, removeFormatting, validateCNPJ, formatCPF, validateCPF } from "@/utils/documentValidation";
import TermosModal from "@/components/shared/TermosModal";

type AccountType = "donor" | "ong" | null;

export default function Register() {
  const router = useRouter();

  // Helper para leitura segura
  const getDraft = () => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(sessionStorage.getItem("register_draft") || "{}");
    } catch (e) { return {}; }
  };
  
  // ==========================================
  // ESTADOS COM LAZY INITIALIZER (Resolve perda de dados e flash)
  // ==========================================
  const [step, setStep] = useState<1 | 2>(() => getDraft().step || 1);
  const [accountType, setAccountType] = useState<AccountType>(() => getDraft().accountType || null);
  const [nome, setNome] = useState(() => getDraft().nome || "");
  const [email, setEmail] = useState(() => getDraft().email || "");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [cnpj, setCnpj] = useState(() => getDraft().cnpj || "");
  const [cpf, setCpf] = useState(() => getDraft().cpf || "");
  
  const [isChecking, setIsChecking] = useState(true);
  const [nomeError, setNomeError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [senhaError, setSenhaError] = useState("");
  const [confirmarSenhaError, setConfirmarSenhaError] = useState("");
  const [docError, setDocError] = useState("");
  const [docShake, setDocShake] = useState(false);
  
  const [modalAberto, setModalAberto] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  // Refs GSAP
  const mainWrapperRef = useRef(null);
  const leftContentRef = useRef(null);
  const imageRef = useRef(null);

  // EFEITO 1: Proteção de Rota
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      router.replace("/home");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  // EFEITO 2: Persistência (Só salva após carregar)
  useEffect(() => {
    if (!isChecking) {
      sessionStorage.setItem("register_draft", JSON.stringify({ step, accountType, nome, email, cpf, cnpj }));
    }
  }, [step, accountType, nome, email, cpf, cnpj, isChecking]);

  // EFEITO 3: Animações GSAP
  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      const leftEl = leftContentRef.current;
      if (leftEl) {
        tl.from((leftEl as any)?.children, { y: 30, opacity: 0, duration: 0.6, stagger: 0.1 });
      }
      const imgEl = imageRef.current;
      if (step === 1 && imgEl) {
        gsap.from(imgEl, { x: 50, opacity: 0, duration: 1.2, ease: "power2.out", delay: 0.2 });
      }
    }, mainWrapperRef);
    return () => ctx.revert();
  }, [step]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleSelectType = (type: AccountType) => {
    setAccountType(type);
    setStep(2);
  };

  const handleBack = () => {
    sessionStorage.removeItem("register_draft");
    setStep(1);
    setAccountType(null);
    setNome(""); setEmail(""); setSenha(""); setConfirmarSenha("");
    setCnpj(""); setCpf("");
    setNomeError(""); setEmailError(""); setSenhaError(""); 
    setConfirmarSenhaError(""); setDocError("");
  };

  function handleNomeBlur() {
    if (!nome) setNomeError("");
    else if (nome.trim().length < 3) setNomeError("O nome deve ter no mínimo 3 caracteres.");
    else if (/\d/.test(nome)) setNomeError("O nome não pode conter números.");
    else setNomeError("");
  }

  function handleEmailBlur() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) setEmailError("");
    else if (!emailRegex.test(email)) setEmailError("Por favor, digite um e-mail válido.");
    else setEmailError("");
  }

  function handleSenhaBlur() {
    if (!senha) setSenhaError("");
    else if (senha.length < 8) setSenhaError("A senha deve ter no mínimo 8 caracteres.");
    else setSenhaError("");
  }

  function handleConfirmarSenhaBlur() {
    if (!confirmarSenha) setConfirmarSenhaError("");
    else if (senha !== confirmarSenha) setConfirmarSenhaError("As senhas não coincidem.");
    else setConfirmarSenhaError("");
  }

  function handleCNPJChange(value: string) {
    const formatted = formatCNPJ(value);
    setCnpj(formatted);
    if (docError) setDocError("");
    const numbers = removeFormatting(formatted);
    if (numbers.length === 14 && !validateCNPJ(formatted)) {
      setDocError("CNPJ inválido");
      triggerShake();
    }
  }

  function handleCPFChange(value: string) {
    const formatted = formatCPF(value);
    setCpf(formatted);
    if (docError) setDocError("");
    const numbers = removeFormatting(formatted);
    if (numbers.length === 11 && !validateCPF(formatted)) {
      setDocError("CPF inválido");
      triggerShake();
    }
  }

  function triggerShake() {
    setDocShake(true);
    setTimeout(() => setDocShake(false), 500);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleNomeBlur();
    handleEmailBlur();
    handleSenhaBlur();
    handleConfirmarSenhaBlur();

    let hasDocError = false;
    if (accountType === 'ong' && (!cnpj || !validateCNPJ(cnpj))) {
      setDocError("CNPJ inválido ou vazio");
      triggerShake();
      hasDocError = true;
    }
    if (accountType === 'donor' && (!cpf || !validateCPF(cpf))) {
      setDocError("CPF inválido ou vazio");
      triggerShake();
      hasDocError = true;
    }

    if (
      !nome || !email || !senha || !confirmarSenha ||
      (nome.trim().length < 3 || /\d/.test(nome)) ||
      (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
      (senha.length < 8) ||
      (senha !== confirmarSenha) ||
      hasDocError
    ) {
      toast.error("Por favor, preencha e corrija os campos em vermelho.");
      return;
    }

setModalAberto(true);
  }

  async function handleRegisterRequest() {
    setIsPending(true);
    try {
      if (accountType === 'ong') {
        const cnpjNumbers = removeFormatting(cnpj);
        await registerOng({ name: nome, email, password: senha, cnpj: cnpjNumbers });
        toast.success("ONG cadastrada com sucesso!");
      } else {
        const cpfNumbers = removeFormatting(cpf);
        await registerDonor({ name: nome, email, password: senha, cpf: cpfNumbers });
        toast.success("Doador cadastrado com sucesso!");
      }
      sessionStorage.removeItem("register_draft");
      setModalAberto(false);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      let errorMessage = "Erro ao criar conta. Verifique os dados.";
      const rawError = err?.response?.data?.message || err?.message;
      if (typeof rawError === "string" && rawError.includes("{")) {
        try {
          const parsedError = JSON.parse(rawError);
          if (Array.isArray(parsedError.message)) errorMessage = parsedError.message[0];
          else if (parsedError.message) errorMessage = parsedError.message;
        } catch (e) {}
      } else if (typeof rawError === "string") { errorMessage = rawError; }

      const msgLower = errorMessage.toLowerCase();
      if (msgLower.includes("email") && (msgLower.includes("exist") || msgLower.includes("unique") || msgLower.includes("use"))) {
        errorMessage = "Este e-mail já está cadastrado.";
      } else if (msgLower.includes("cpf") && (msgLower.includes("exist") || msgLower.includes("unique") || msgLower.includes("use"))) {
        errorMessage = "Já existe uma conta com este CPF.";
      } else if (msgLower.includes("cnpj") && (msgLower.includes("exist") || msgLower.includes("unique") || msgLower.includes("use"))) {
        errorMessage = "Já existe uma ONG com este CNPJ.";
      }
      toast.error(errorMessage);
    } finally {
      setIsPending(false);
    }
  }

  if (isChecking) {
    return <div className="min-h-[100dvh] w-full bg-[#F9FAFB] lg:bg-white"></div>;
  }

  return (
    <div ref={mainWrapperRef} className="flex min-h-[100dvh] w-full font-sans selection:bg-[#6B39A7] selection:text-white bg-[#F9FAFB] lg:bg-white overflow-hidden">
      <Toaster position="top-center" />

      <TermosModal isOpen={modalAberto} onConfirm={handleRegisterRequest} onCancel={() => setModalAberto(false)} isLoading={isPending} />

      {/* LADO ESQUERDO */}
      <div className="w-full lg:w-1/2 flex flex-col relative items-center justify-center px-6 sm:px-12 py-10 overflow-y-auto">
        <div ref={leftContentRef} className="w-full max-w-[460px] shrink-0">
          
          {step === 1 && (
            <>
              <div className="mb-10 text-left">
                <h1 className="text-4xl sm:text-[3rem] font-bold text-gray-900 mb-2 tracking-tight leading-tight">Junte-se a nós!</h1>
                <p className="text-gray-500 text-lg font-medium">Como você deseja usar o DoeCerto?</p>
              </div>

              <div className="flex flex-col gap-4">
                <button onClick={() => handleSelectType("donor")} className="group relative flex items-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#6B39A7] hover:shadow-[0_8px_30px_-10px_rgba(107,57,167,0.2)] transition-all duration-300 text-left active:scale-[0.98]">
                  <div className="w-14 h-14 rounded-full bg-[#F3E8FF] flex items-center justify-center mr-5 shrink-0 group-hover:bg-[#6B39A7] transition-colors duration-300">
                    <User className="text-[#6B39A7] group-hover:text-white transition-colors duration-300" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Sou um Doador</h3>
                    <p className="text-gray-500 text-sm font-medium">Quero encontrar campanhas e ajudar causas sociais.</p>
                  </div>
                </button>

                <button onClick={() => handleSelectType("ong")} className="group relative flex items-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#6B39A7] hover:shadow-[0_8px_30px_-10px_rgba(107,57,167,0.2)] transition-all duration-300 text-left active:scale-[0.98]">
                  <div className="w-14 h-14 rounded-full bg-[#F3E8FF] flex items-center justify-center mr-5 shrink-0 group-hover:bg-[#6B39A7] transition-colors duration-300">
                    <Building2 className="text-[#6B39A7] group-hover:text-white transition-colors duration-300" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Sou uma ONG</h3>
                    <p className="text-gray-500 text-sm font-medium">Quero cadastrar minha instituição e receber doações.</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={handleBack} className="flex items-center text-gray-500 hover:text-[#6B39A7] font-semibold mb-6 transition-colors group w-fit">
                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar
              </button>

              <div className="mb-8 text-left">
                <h1 className="text-4xl sm:text-[2.5rem] font-bold text-gray-900 mb-2 tracking-tight leading-tight">
                  Criar conta {accountType === 'ong' ? 'ONG' : 'Doador'}
                </h1>
                <p className="text-gray-500 text-lg font-medium">Preencha os dados abaixo para começar.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                {/* Nome */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="nome" className="text-gray-800 text-base font-bold tracking-wide">
                    {accountType === 'ong' ? 'Nome da Instituição' : 'Nome Completo'}
                  </label>
                  <div className="relative group">
                    {accountType === 'ong' ? (
                       <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${nomeError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#6B39A7]'}`} size={22} />
                    ) : (
                       <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${nomeError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#6B39A7]'}`} size={22} />
                    )}
                    <input 
                      id="nome" type="text" required 
                      placeholder={accountType === 'ong' ? "Razão Social ou Nome Fantasia" : "Digite seu nome"} 
                      value={nome} 
                      onChange={(e) => { setNome(e.target.value); if(nomeError) setNomeError(""); }} 
                      onBlur={handleNomeBlur}
                      className={`w-full bg-white border text-gray-900 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-lg font-medium shadow-sm ${nomeError ? "border-red-400 focus:border-red-500 ring-red-100 ring-2" : "border-gray-200 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7]"}`} 
                    />
                    {nomeError && <div className="absolute right-4 top-1/2 -translate-y-1/2"><AlertCircle size={22} className="text-red-500" /></div>}
                  </div>
                  {nomeError && <span className="text-red-500 text-sm font-bold mt-1">{nomeError}</span>}
                </div>

                {/* CPF/CNPJ */}
                <div className="flex flex-col gap-2 relative">
                  <label htmlFor="documento" className="text-gray-800 text-base font-bold tracking-wide">
                    {accountType === 'ong' ? 'CNPJ' : 'CPF'}
                  </label>
                  <div className="relative group">
                    {accountType === 'ong' ? (
                      <FileText className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${docError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#6B39A7]'}`} size={22} />
                    ) : (
                      <IdCard className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${docError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#6B39A7]'}`} size={22} />
                    )}
                    <input
                      id="documento" type="text" required maxLength={accountType === 'ong' ? 18 : 14}
                      placeholder={accountType === 'ong' ? "00.000.000/0000-00" : "000.000.000-00"}
                      value={accountType === 'ong' ? cnpj : cpf}
                      onChange={(e) => accountType === 'ong' ? handleCNPJChange(e.target.value) : handleCPFChange(e.target.value)}
                      className={`w-full bg-white border text-gray-900 rounded-xl pl-12 pr-10 py-4 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-lg font-medium shadow-sm ${docError ? "border-red-400 focus:border-red-500 ring-red-100 ring-2" : "border-gray-200 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7]"} ${docShake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
                    />
                    {docError && <div className="absolute right-4 top-1/2 -translate-y-1/2"><AlertCircle size={22} className="text-red-500" /></div>}
                  </div>
                  {docError && <span className="text-red-500 text-sm font-bold mt-1">{docError}</span>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-gray-800 text-base font-bold tracking-wide">Endereço de Email</label>
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${emailError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#6B39A7]'}`} size={22} />
                    <input 
                      id="email" type="email" required placeholder="exemplo@email.com" 
                      value={email} 
                      onChange={(e) => { setEmail(e.target.value); if(emailError) setEmailError(""); }} 
                      onBlur={handleEmailBlur}
                      className={`w-full bg-white border text-gray-900 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-lg font-medium shadow-sm ${emailError ? "border-red-400 focus:border-red-500 ring-red-100 ring-2" : "border-gray-200 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7]"}`} 
                    />
                    {emailError && <div className="absolute right-4 top-1/2 -translate-y-1/2"><AlertCircle size={22} className="text-red-500" /></div>}
                  </div>
                  {emailError && <span className="text-red-500 text-sm font-bold mt-1">{emailError}</span>}
                </div>

                {/* Senha */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="senha" className="text-gray-800 text-base font-bold tracking-wide">Senha</label>
                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${senhaError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#6B39A7]'}`} size={22} />
                    <input 
                      id="senha" type={showSenha ? "text" : "password"} required minLength={8} placeholder="Mínimo de 8 caracteres" 
                      value={senha} 
                      onChange={(e) => { setSenha(e.target.value); if(senhaError) setSenhaError(""); }} 
                      onBlur={handleSenhaBlur}
                      className={`w-full bg-white border text-gray-900 rounded-xl pl-12 pr-12 py-4 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-lg font-medium shadow-sm ${senhaError ? "border-red-400 focus:border-red-500 ring-red-100 ring-2" : "border-gray-200 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7]"}`} 
                    />
                    <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6B39A7] transition-colors cursor-pointer"><Eye size={20} /></button>
                    {senhaError && <div className="absolute right-4 top-1/2 -translate-y-1/2"><AlertCircle size={22} className="text-red-500" /></div>}
                  </div>
                  {senhaError && <span className="text-red-500 text-sm font-bold mt-1">{senhaError}</span>}
                </div>

                {/* Confirmar Senha */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="confirmarSenha" className="text-gray-800 text-base font-bold tracking-wide">Confirmar Senha</label>
                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${confirmarSenhaError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#6B39A7]'}`} size={22} />
                    <input 
                      id="confirmarSenha" type={showConfirmar ? "text" : "password"} required placeholder="Repita sua senha" 
                      value={confirmarSenha} 
                      onChange={(e) => { setConfirmarSenha(e.target.value); if(confirmarSenhaError) setConfirmarSenhaError(""); }} 
                      onBlur={handleConfirmarSenhaBlur}
                      className={`w-full bg-white border text-gray-900 rounded-xl pl-12 pr-12 py-4 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-lg font-medium shadow-sm ${confirmarSenhaError ? "border-red-400 focus:border-red-500 ring-red-100 ring-2" : "border-gray-200 focus:ring-[#6B39A7]/20 focus:border-[#6B39A7]"}`} 
                    />
                    <button type="button" onClick={() => setShowConfirmar(!showConfirmar)} className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6B39A7] transition-colors cursor-pointer"><Eye size={20} /></button>
                    {confirmarSenhaError && <div className="absolute right-4 top-1/2 -translate-y-1/2"><AlertCircle size={22} className="text-red-500" /></div>}
                  </div>
                  {confirmarSenhaError && <span className="text-red-500 text-sm font-bold mt-1">{confirmarSenhaError}</span>}
                </div>

                <button type="submit" disabled={isPending} className="w-full flex justify-center items-center h-[60px] mt-4 bg-[#4A2675] hover:bg-[#3b1a66] text-white font-bold text-lg rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(74,38,117,0.5)]">
                  {isPending ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : (accountType === 'ong' ? "Continuar e Ler Termos" : "Criar Conta")}
                </button>
              </form>
            </>
          )}

          <div className="text-center mt-8 border-t border-gray-100 pt-6">
            <span className="text-lg text-gray-500 font-medium">Já tem uma conta? </span>
            <Link href="/login" className="text-lg font-bold text-[#6B39A7] hover:text-purple-800 transition-colors">Entrar</Link>
          </div>

        </div>
      </div>

      {/* LADO DIREITO */}
      <div className="hidden lg:block w-1/2 relative h-screen bg-transparent">
        <div ref={imageRef} className="absolute inset-y-0 right-0 left-0 rounded-l-[3.5rem] overflow-hidden shadow-[-20px_0_40px_rgba(0,0,0,0.05)]">
          <img src="/fotocrianca.jpg" alt="Fundo Registro" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4A2675]/30 via-transparent to-transparent mix-blend-multiply"></div>
        </div>
      </div>
    </div>
  );
}