"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DonateClient({ id }: { id: string }) {
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/pix?id=${id}`);
    } else {
      router.replace("/home");
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-purple-600" size={32} />
      <p className="text-slate-600 font-medium">Redirecionando para o checkout Pix oficial...</p>
    </div>
  );
}

