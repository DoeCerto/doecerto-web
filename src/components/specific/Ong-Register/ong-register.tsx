"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react"; 
import { registerOng } from "@/services/register-ong.service";
import { formatCNPJ, removeFormatting, validateCNPJ } from "@/utils/documentValidation";

export default function OngRegisterPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isPending, setIsPending] = useState(false);

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  
  // Estados para validação do CNPJ
  const [cnpjError, setCnpjError] = useState("");
  const [cnpjShake, setCnpjShake] = useState(false);

  const senhasPreenchidas = senha.length > 0 && confirmarSenha.length > 0;
  const senhasCoincidem = senhasPreenchidas && senha === confirmarSenha;
  const senhasDiferentes = senhasPreenchidas && senha !== confirmarSenha;

  // Handler do CNPJ com máscara e validação
  function handleCNPJChange(value: string) {
    const formatted = formatCNPJ(value);
    setCnpj(formatted);
    
    // Limpa erro ao digitar
    if (cnpjError) {
      setCnpjError("");
    }

    // Se chegou no limite, valida
    const numbers = removeFormatting(formatted);
    if (numbers.length === 14) {
      if (!validateCNPJ(formatted)) {
        setCnpjError("CNPJ inválido");
        triggerShake();
      }
    }
  }

  function triggerShake() {
    setCnpjShake(true);
    setTimeout(() => setCnpjShake(false), 500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome || !email || !cnpj || !senha || !confirmarSenha) {
      toast.error("Preencha todos os campos");
      return;
    }

    // Valida CNPJ antes de submeter
    if (!validateCNPJ(cnpj)) {
      setCnpjError("CNPJ inválido");
      triggerShake();
      toast.error("CNPJ inválido");
      return;
    }

    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsPending(true);

    try {
      // Remove formatação antes de enviar para API
      const cnpjNumbers = removeFormatting(cnpj);
      
      await registerOng({
        name: nome,
        email,
        password: senha,
        cnpj: cnpjNumbers,
      });

      toast.success("ONG cadastrada com sucesso!");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      toast.error("Erro ao cadastrar ONG. Verifique os dados.");
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6B39A7] text-white font-sans px-6 py-12">
      <Toaster position="top-center" />

       <div className="absolute top-6 left-6 z-10">
        <Link
          href="/login"
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
          Cadastre sua ONG!
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Nome */}
          <div className="flex flex-col">
            <label htmlFor="nome" className="text-base font-bold mb-1">Nome</label>
            <input
              id="nome"
              type="text"
              required
              placeholder="Digite o nome da ONG"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="bg-white p-2 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label htmlFor="email" className="text-base font-bold mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white p-2 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
            />
          </div>

          {/* CNPJ */}
          <div className="flex flex-col relative">
            <label htmlFor="cnpj" className="text-base font-bold mb-1">CNPJ</label>
            <div className="relative">
              <input
                id="cnpj"
                type="text"
                required
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => handleCNPJChange(e.target.value)}
                maxLength={18}
                className={`w-full bg-white p-2 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 transition-all ${
                  cnpjError 
                    ? "ring-2 ring-red-400 shake" 
                    : "focus:ring-purple-300"
                } ${cnpjShake ? "shake" : ""}`}
              />
              {cnpjError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
              )}
            </div>
            {cnpjError && (
              <div className="mt-1 flex items-center gap-1 text-red-300 text-sm font-bold animate-fadeIn">
                <AlertCircle size={14} />
                <span>{cnpjError}</span>
              </div>
            )}
            <span className="text-xs text-purple-200 mt-1">
              O CNPJ deve conter exatamente 14 dígitos
            </span>
          </div>

          {/* Senha */}
          <div className="flex flex-col relative">
            <label htmlFor="senha" className="text-base font-bold mb-1">Senha</label>
            <div className="relative">
              <input
                id="senha"
                type={showSenha ? "text" : "password"}
                required
                minLength={6}
                placeholder="Mínimo de 8 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={`w-full bg-white p-2 pr-10 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 transition-all ${
                  senhasCoincidem ? "ring-2 ring-green-400" : "focus:ring-purple-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSenha ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
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
                }`}
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
              <div className="w-7 h-7 border-4 border-purple-700/30 border-t-purple-700 rounded-full animate-spin"></div>
            ) : (
              "Cadastrar ONG"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}