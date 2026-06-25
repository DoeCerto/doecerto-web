"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { registerDonor } from "@/services/register.service";
import { formatCPF, removeFormatting, validateCPF } from "@/utils/documentValidation";
import TermosModal from "@/components/shared/TermosModal";

export default function Register() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isPending, setIsPending] = useState(false);

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  // Estados de Erro
  const [nomeError, setNomeError] = useState("");
  const [cpfError, setCpfError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [senhaError, setSenhaError] = useState("");

  // Estados do Efeito Shake (Independentes para cada campo)
  const [nomeShake, setNomeShake] = useState(false);
  const [cpfShake, setCpfShake] = useState(false);
  const [emailShake, setEmailShake] = useState(false);
  const [senhaShake, setSenhaShake] = useState(false);

  // Controle do modal
  const [modalAberto, setModalAberto] = useState(false);

  const senhasPreenchidas = senha.length > 0 && confirmarSenha.length > 0;
  const senhasCoincidem = senhasPreenchidas && senha === confirmarSenha;
  const senhasDiferentes = senhasPreenchidas && senha !== confirmarSenha;

  
  function triggerNomeShake() {
    setNomeShake(true);
    setTimeout(() => setNomeShake(false), 500);
  }

  function triggerCpfShake() {
    setCpfShake(true);
    setTimeout(() => setCpfShake(false), 500);
  }

  function triggerEmailShake() {
    setEmailShake(true);
    setTimeout(() => setEmailShake(false), 500);
  }

  function triggerSenhaShake() {
    setSenhaShake(true);
    setTimeout(() => setSenhaShake(false), 500);
  }

  
  function handleNomeChange(value: string) {
  setNome(value);
  if (nomeError) setNomeError("");
}

  function handleCPFChange(value: string) {
    const formatted = formatCPF(value);
    setCpf(formatted);
    if (cpfError) setCpfError("");
    
    const numbers = removeFormatting(formatted);
    if (numbers.length === 11) {
      if (!validateCPF(formatted)) {
        setCpfError("CPF inválido");
        triggerCpfShake();
      }
    }
  }

  function handleNomeBlur() {
  if (!nome.trim()) return;

  if (nome.trim().length < 3) {
    setNomeError("O nome deve conter pelo menos 3 caracteres");
    triggerNomeShake();
  } else if (/\d/.test(nome)) {
    setNomeError("O nome não pode conter números");
    triggerNomeShake();
  }
}

function handleEmailBlur() {
  if (!email.trim()) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setEmailError("Email inválido");
    triggerEmailShake(); // Ativa o tremor do email
  }
}

  function handleEmailChange(value: string) {
  setEmail(value);
  if (emailError) setEmailError(""); 
}

  function handleSenhaChange(value: string) {
    setSenha(value);
    if (senhaError) setSenhaError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Reseta erros anteriores
    setNomeError("");
    setCpfError("");
    setEmailError("");
    setSenhaError("");

    let hasError = false;

    
    if (!nome || nome.trim().length < 3) {
      setNomeError("O nome deve conter pelo menos 3 caracteres");
      triggerNomeShake();
      hasError = true;
    } else if (/\d/.test(nome)) {
      setNomeError("O nome não pode conter números");
      triggerNomeShake();
      hasError = true;
    }

   
    if (!validateCPF(cpf)) {
      setCpfError("CPF inválido");
      triggerCpfShake();
      hasError = true;
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError("Email inválido");
      triggerEmailShake();
      hasError = true;
    }

    
    if (!senha || senha.length < 6) {
      setSenhaError("A senha deve ter pelo menos 6 caracteres");
      triggerSenhaShake();
      hasError = true;
    }

    if (senha !== confirmarSenha) {
      setSenhaError("As senhas não coincidem");
      triggerSenhaShake();
      hasError = true;
    }

    if (hasError) return;

    setModalAberto(true);
  }

  async function handleConfirmarCadastro() {
    setIsPending(true);

    try {
      const cpfNumbers = removeFormatting(cpf);

      await registerDonor({
        name: nome,
        email,
        password: senha,
        cpf: cpfNumbers,
      });

      setModalAberto(false);
      toast.success("Cadastro realizado com sucesso!");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      toast.error("Erro ao realizar cadastro");
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6B39A7] text-white font-sans px-6 py-12">
      <Toaster position="top-center" />

      {/* Modal de termos */}
      <TermosModal
        isOpen={modalAberto}
        onConfirm={handleConfirmarCadastro}
        onCancel={() => setModalAberto(false)}
        isLoading={isPending}
      />

      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/register-choice"
          className="flex items-center gap-2 text-white font-bold text-base hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={24} strokeWidth={3} />
          <span className="hidden xs:inline">Voltar</span>
        </Link>
      </div>

      <div className="w-full max-w-xs flex flex-col items-center">
        <div className="mb-4">
          <Image src="/logo.svg" alt="DoeCerto" width={120} height={120} priority />
        </div>

        <h1 className="text-4xl -mt-2 font-bold mb-8 text-center">
          Cadastre-se
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Nome */}
          <div className="flex flex-col">
            <label htmlFor="nome" className="text-base font-bold mb-1">Nome</label>
            <div className="relative">
              <input
                id="nome"
                type="text"
                required
                placeholder="Digite seu nome completo"
                value={nome}
                onChange={(e) => handleNomeChange(e.target.value)}
                onBlur={handleNomeBlur}
                className={`w-full bg-white p-2 pr-10 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 transition-all ${
                  nomeError ? "ring-2 ring-red-400" : "focus:ring-purple-300"
                } ${nomeShake ? "shake" : ""}`}
              />
              {nomeError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
              )}
            </div>
            {nomeError && (
              <div className="mt-1 flex items-center gap-1 text-red-300 text-sm font-bold animate-fadeIn">
                <AlertCircle size={14} />
                <span>{nomeError}</span>
              </div>
            )}
          </div>

          {/* CPF */}
          <div className="flex flex-col">
            <label htmlFor="cpf" className="text-base font-bold mb-1">CPF</label>
            <div className="relative">
              <input
                id="cpf"
                type="text"
                required
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => handleCPFChange(e.target.value)}
                maxLength={14}
                className={`w-full bg-white p-2 pr-10 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 transition-all ${
                  cpfError ? "ring-2 ring-red-400" : "focus:ring-purple-300"
                } ${cpfShake ? "shake" : ""}`}
              />
              {cpfError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
              )}
            </div>
            {cpfError && (
              <div className="mt-1 flex items-center gap-1 text-red-300 text-sm font-bold animate-fadeIn">
                <AlertCircle size={14} />
                <span>{cpfError}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label htmlFor="email" className="text-base font-bold mb-1">Email</label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                className={`w-full bg-white p-2 pr-10 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 transition-all ${
                  emailError ? "ring-2 ring-red-400" : "focus:ring-purple-300"
                } ${emailShake ? "shake" : ""}`}
              />
              {emailError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
              )}
            </div>
            {emailError && (
              <div className="mt-1 flex items-center gap-1 text-red-300 text-sm font-bold animate-fadeIn">
                <AlertCircle size={14} />
                <span>{emailError}</span>
              </div>
            )}
          </div>

          {/* Senha */}
          <div className="flex flex-col">
            <label htmlFor="senha" className="text-base font-bold mb-1">Senha</label>
            <div className="relative">
              <input
                id="senha"
                type={showSenha ? "text" : "password"}
                required
                minLength={6}
                placeholder="Mínimo de 6 caracteres"
                value={senha}
                onChange={(e) => handleSenhaChange(e.target.value)}
                className={`w-full bg-white p-2 pr-10 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 transition-all ${
                  senhasCoincidem ? "ring-2 ring-green-400" : 
                  senhaError ? "ring-2 ring-red-400" : "focus:ring-purple-300"
                } ${senhaShake ? "shake" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSenha ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {senhaError && (
              <div className="mt-1 flex items-center gap-1 text-red-300 text-sm font-bold animate-fadeIn">
                <AlertCircle size={14} />
                <span>{senhaError}</span>
              </div>
            )}
          </div>

          {/* Confirmar Senha */}
          <div className="flex flex-col">
            <label htmlFor="confirmarSenha" className="text-base font-bold mb-1">Confirmar Senha</label>
            <div className="relative">
              <input
                id="confirmarSenha"
                type={showConfirmar ? "text" : "password"}
                required
                placeholder="Repita sua senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className={`w-full bg-white p-2 pr-10 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 transition-all ${
                  senhasCoincidem ? "ring-2 ring-green-400" :
                  senhasDiferentes ? "ring-2 ring-red-400" : "focus:ring-purple-300"
                } ${senhaShake ? "shake" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmar(!showConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmar ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {senhasDiferentes && (
              <span className="text-red-300 text-sm font-bold mt-1">
                As senhas não coincidem
              </span>
            )}
          </div>

          <p className="text-base text-right font-bold -mt-2 mb-4">
            Já possui conta?{" "}
            <Link href="/login" className="font-bold text-[#E0C4FF] hover:underline transition-all">
              Fazer Login
            </Link>
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center items-center bg-white text-purple-700 font-bold py-3 rounded-md active:scale-95 transition-all disabled:opacity-70 shadow-md text-xl"
          >
            {isPending ? (
              <div className="w-7 h-7 border-4 border-purple-700/30 border-t-purple-700 rounded-full animate-spin" />
            ) : (
              "Cadastrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}