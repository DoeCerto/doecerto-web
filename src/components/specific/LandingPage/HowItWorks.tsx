"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%", 
        toggleActions: "play none none none",
      }
    });

    tl.from(imageRef.current, { x: -50, opacity: 0, duration: 1, ease: "power3.out" }, 0);
    tl.from(textRef.current?.children || [], { y: 40, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }, 0.2);
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="howitworks" className="bg-[#6B39A7] text-white pt-24 pb-20 md:pt-36 md:pb-32 lg:pt-48 lg:pb-40 -mt-1 md:-mt-10 relative z-10">
      {/* Ajuste de padding lateral responsivo */}
      <div className="container mx-auto px-6 md:px-16 lg:px-32">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">

          <div ref={imageRef} className="w-full lg:w-1/2">
            <img src="/image 1.png" alt="Como funciona" className="w-full h-auto rounded-3xl object-cover transition-transform duration-700 hover:scale-105 shadow-2xl lg:shadow-none" />
          </div>

          <div ref={textRef} className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
            {/* Fonte escalável: text-4xl mobile, text-5xl tablet, text-[64px] desktop */}
            <h2 className="font-['Poppins'] text-4xl md:text-5xl lg:text-[64px] font-extrabold tracking-tight lg:tracking-[-0.025em] leading-[1.1] lg:leading-[0.95] mb-8 lg:mb-10 text-white">
              Como funciona o <br className="hidden md:block" />
              DoeCerto?
            </h2>

            <div className="text-lg md:text-xl text-white/85 space-y-6 font-['Poppins']">
              <p className="leading-relaxed font-light">
                Navegue por instituições <span className="font-medium text-white">rigorosamente verificadas</span>. e selecione a causa que alinha com seus valores. O processo é intuitivo, transparente e seguro, garantindo que cada doação seja direcionada para quem realmente precisa.
              </p>
              <p className="leading-relaxed font-light">
                Acompanhe o impacto com <span className="font-medium text-white">transparência total</span>, recebendo atualizações reais de <span className="font-medium text-white">onde sua doação está mudando vidas</span>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}