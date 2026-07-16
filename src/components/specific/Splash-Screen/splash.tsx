"use client";

import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import animationData from "@/assets/animations/loading.json";

export default function Splash() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#6B39A7]">


      <div className="w-[550px] h-[550px] flex items-center justify-center will-change: transform; transform: translateZ(0); backface-visibility: hidden;">
        <Lottie
          animationData={animationData}
          loop={0}
          autoplay={true}
          onComplete={() => {
            router.push("/login");
          }}
        />
      </div>

    </div>
  );
}