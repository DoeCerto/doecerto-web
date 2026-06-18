"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { registerDonor } from "@/services/register.service";
import {
  formatCPF,
  removeFormatting,
  validateCPF,
} from "@/utils/documentValidation";
import TermosModal from "@/components/shared/TermosModal"; // ← NOVO

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

  const [cpfError, setCpfError] = useState("");
  const [cpfShake, setCpfShake] = useState(false);

  // ← NOVO — controle do modal
  const [modalAberto, setModalAberto] = useState(false);

  const senhasPreenchidas = senha.length > 0 && confirmarSenha.length > 0;
  const senhasCoincidem = senhasPreenchidas && senha === confirmarSenha;
  const senhasDiferentes = senhasPreenchidas && senha !== confirmarSenha;

  function handleCPFChange(value: string) {
    const formatted = formatCPF(value);
    setCpf(formatted);
    if (cpfError) setCpfError("");
    const numbers = removeFormatting(formatted);
    if (numbers.length === 11) {
      if (!validateCPF(formatted)) {
        setCpfError("CPF inválido");
        triggerShake();
      }
    }
  }

  function triggerShake() {
    setCpfShake(true);
    setTimeout(() => setCpfShake(false), 500);
  }

  // ← MODIFICADO — agora só valida e abre o modal, não envia ainda
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome || !cpf || !email || !senha || !confirmarSenha) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (!validateCPF(cpf)) {
      setCpfError("CPF inválido");
      triggerShake();
      toast.error("CPF inválido");
      return;
    }

    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    // Abre o modal de termos
    setModalAberto(true);
  }

  // ← NOVO — chamado após confirmar no modal
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

      {/* ← NOVO — Modal de termos */}
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
          <Image
            src="/logo.svg"
            alt="DoeCerto"
            width={120}
            height={120}
            priority
          />
        </div>

        <h1 className="text-4xl -mt-2 font-bold mb-8 text-center">
          Cadastre-se
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Nome */}
          <div className="flex flex-col">
            <label htmlFor="nome" className="text-base font-bold mb-1">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              placeholder="Digite seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="bg-white p-2 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
            />
          </div>

          {/* CPF */}
          <div className="flex flex-col relative">
            <label htmlFor="cpf" className="text-base font-bold mb-1">
              CPF
            </label>
            <div className="relative">
              <input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => handleCPFChange(e.target.value)}
                maxLength={14}
                className={`w-full bg-white p-2 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 transition-all ${
                  cpfError
                    ? "ring-2 ring-red-400 shake"
                    : "focus:ring-purple-300"
                } ${cpfShake ? "shake" : ""}`}
              />
              {cpfError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
            <span className="text-xs text-purple-200 mt-1">
              O CPF deve conter exatamente 11 dígitos
            </span>
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label htmlFor="email" className="text-base font-bold mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white p-2 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col relative">
            <label htmlFor="senha" className="text-base font-bold mb-1">
              Senha
            </label>
            <div className="relative">
              <input
                id="senha"
                type={showSenha ? "text" : "password"}
                minLength={6}
                placeholder="Mínimo de 8 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={`w-full bg-white p-2 pr-10 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 transition-all ${
                  senhasCoincidem
                    ? "ring-2 ring-green-400"
                    : "focus:ring-purple-300"
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
            <label
              htmlFor="confirmarSenha"
              className="text-base font-bold mb-1"
            >
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                id="confirmarSenha"
                type={showConfirmar ? "text" : "password"}
                placeholder="Repita sua senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className={`w-full bg-white p-2 pr-10 rounded-md text-black text-xl placeholder:text-lg focus:outline-none focus:ring-2 transition-all ${
                  senhasCoincidem
                    ? "ring-2 ring-green-400"
                    : senhasDiferentes
                      ? "ring-2 ring-red-400"
                      : "focus:ring-purple-300"
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

          <p className="text-base text-right font-light -mt-2 mb-4">
            Já possui conta?{" "}
            <Link
              href="/login"
              className="font-bold text-[#E0C4FF] hover:underline transition-all"
            >
              Fazer Login
            </Link>
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="w-60 mx-auto flex justify-center items-center text-2xl bg-white text-[#6B39A7] font-bold py-2 rounded-md border-2 border-white transition-all duration-300 hover:shadow-xl hover:shadow-[#6B39A7]/40 hover:-translate-y-1 active:scale-95 mb-8 cursor-pointer"
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
