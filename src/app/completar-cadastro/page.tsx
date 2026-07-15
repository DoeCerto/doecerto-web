"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/services/api";

export default function CompletarCadastroPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const email = localStorage.getItem("@DoeCerto:tempEmail");
      const tempToken = localStorage.getItem("@DoeCerto:tempToken");

      // Rota que você criará no seu backend para finalizar o cadastro
const response = await api("/users/complete-profile", {
  method: "POST", // Especificamos o método aqui
  body: JSON.stringify({ // O corpo precisa ser stringificado manualmente
    cpf,
    email,
  }),
  headers: { 
    "Authorization": `Bearer ${tempToken}`,
    "Content-Type": "application/json" 
  },
});

      toast.success("Cadastro finalizado com sucesso!");
      
      // Limpa os dados temporários e vai pra home
      localStorage.removeItem("@DoeCerto:tempEmail");
      localStorage.removeItem("@DoeCerto:tempToken");
      router.push("/home");
      
    } catch (error) {
      toast.error("Erro ao salvar CPF. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleComplete} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Finalizar Cadastro</h1>
        <p className="mb-4 text-gray-600">Precisamos apenas do seu CPF para continuar.</p>
        
        <input 
          type="text"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="w-full p-4 border rounded-lg mb-6"
          required
        />
        
        <button 
          type="submit"
          disabled={isPending}
          className="w-full bg-[#4A2675] text-white p-4 rounded-lg font-bold"
        >
          {isPending ? "Salvando..." : "Confirmar"}
        </button>
      </form>
    </div>
  );
}