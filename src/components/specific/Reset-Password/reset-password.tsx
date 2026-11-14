"use client";

import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";


function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Token inválido ou ausente. Solicite uma nova recuperação.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao atualizar senha.");
      }

      toast.success("Senha atualizada com sucesso!", { duration: 4000 });
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err: any) {
      toast.error(err.message || "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6B39A7] text-white px-6">
      <Toaster position="top-center" />

      <div className="w-full max-w-xs flex flex-col items-center">
        <div className="mb-2">
          <Image src="/logo.svg" alt="DoeCerto" width={120} height={120} priority />
        </div>

        <h1 className="text-4xl font-bold mb-6 text-center">Nova Senha</h1>
        
        <p className="text-center text-lg font-bold text-purple-100 mb-8 leading-tight">
          Crie uma nova senha segura para acessar sua conta.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-lg font-bold mb-1">Nova Senha</label>
            <input
              type="password"
              placeholder="Digite a nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-white p-2 rounded-md text-black text-xl focus:outline-none shadow-md"
              required
            />
          </div>

          <div className="flex flex-col mb-4">
            <label className="text-lg font-bold mb-1">Confirmar Senha</label>
            <input
              type="password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white p-2 rounded-md text-black text-xl focus:outline-none shadow-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full text-center text-2xl bg-white text-[#6B39A7] font-bold py-2 rounded-md active:scale-95 transition-all shadow-lg disabled:opacity-70"
          >
            {loading ? "Salvando..." : "Atualizar Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#6B39A7] text-white font-bold">
        Carregando...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}