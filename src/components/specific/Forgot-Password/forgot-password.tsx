"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordComponent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor, digite seu e-mail");
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao solicitar recuperação");
      }

      // Mensagem simples conforme solicitado
      toast.success("E-mail enviado! Verifique sua caixa de entrada e spam para redefinir sua senha", {
        duration: 6000,
      });
      
      setTimeout(() => {
        router.push("/login");
      }, 4000);

    } catch (err: any) {
      toast.error(err.message || "Erro ao conectar com o servidor");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#6B39A7] text-white px-6 pt-20 pb-10">
      <Toaster position="top-center" />

      {/* Botão Voltar - Ajustado para não sumir em telas pequenas */}
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
          <Image src="/logo.svg" alt="DoeCerto" width={220} height={80} priority  className="w-full h-auto"/>
        </div>

        <h1 className="text-2xl -mt-2 font-bold mb-6 text-center leading-tight">
          Recuperar Senha
        </h1>

        <p className="text-center text-lg font-bold text-purple-100 mb-8 leading-tight">
          Não se preocupe! Digite seu e-mail abaixo para recuperar seu acesso.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          <div className="flex flex-col mb-8">
            <label htmlFor="email" className="text-lg font-bold mb-1">E-mail cadastrado</label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white p-2 rounded-md text-black text-xl placeholder:text-lg placeholder-gray-500 focus:outline-none shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-60 mx-auto flex justify-center items-center text-2xl bg-white text-[#6B39A7] font-bold py-2 rounded-md border-2 border-white transition-all duration-300 hover:shadow-xl hover:shadow-[#6B39A7]/40 hover:-translate-y-1 active:scale-95 mb-8 cursor-pointer"
          >
            {isPending ? (
              <div className="w-7 h-7 border-4 border-[#6B39A7]/30 border-t-[#6B39A7] rounded-full animate-spin"></div>
            ) : (
              "Recuperar Senha"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}