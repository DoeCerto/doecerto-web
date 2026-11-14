"use client";

import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import animationData from "@/assets/animations/loading.json";

export default function Splash() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#6B39A7]">
      <div className="w-[550px] h-[550px] flex items-center justify-center will-change-transform translate-z-0 backface-hidden">
        <DotLottieReact
          data={animationData}
          loop={false}
          autoplay={true}
          dotLottieRefCallback={(dotLottie) => {
            if (dotLottie) {
              dotLottie.addEventListener("complete", () => {
                router.push("/home");
              });
            }
          }}
        />
      </div>
    </div>
  );
}