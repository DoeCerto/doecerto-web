"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Home from "@/components/specific/Home/home";


function TokenProcessor({ onReady }: { onReady: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("access_token", token);
      router.replace("/home");
      onReady(); 
    } else if (localStorage.getItem("access_token")) {
      onReady(); 
    } else {
      onReady(); 
    }
  }, [searchParams, router, onReady]);

  return null; 
}


export default function HomePage() {
  const [tokenReady, setTokenReady] = useState(false);

  return (
    <>
      <Suspense fallback={null}>
        <TokenProcessor onReady={() => setTokenReady(true)} />
      </Suspense>
      {!tokenReady ? (
        <div>Carregando...</div>
      ) : (
        <div>
          <Home />
        </div>
      )}
    </>
  );
}