"use client";
import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#572B8B] pt-16 md:pt-24 pb-8">
      <div className="w-full px-6 md:px-12 lg:px-[8vw] mx-auto max-w-[1600px]">

        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-12 md:mb-16">

          {/* Coluna 1: Centralizada no mobile, alinhada à esquerda no desktop */}
          <div className="max-w-md mx-auto lg:mx-0 text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:justify-start">
              <div className="relative w-40 md:w-48 h-10">
                <Image src="/logo.svg" alt="Logo DoeCerto" fill className="object-contain lg:object-left" />
              </div>
            </div>
            <p className="text-white/80 text-sm md:text-base font-light leading-relaxed">
              Tecnologia de ponta para tornar suas doações mais eficientes, seguras e impactantes. Ajudamos a conectar corações dispostos a mudar o mundo.
            </p>
          </div>

          {/* Colunas da Direita: Usando grid de 2 colunas no mobile para aproveitar espaço */}
          <div className="grid grid-cols-2 md:flex md:flex-row flex-wrap gap-10 md:gap-16 lg:gap-28">
            <div>
              <h3 className="text-white font-semibold mb-4 md:mb-6">Plataforma</h3>
              <ul className="space-y-3 md:space-y-4 text-white/80 text-sm font-light">
                <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Cadastre-se</Link></li>
                <li><Link href="/ongs" className="hover:text-white transition-colors">Catálogo de ONGs</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4 md:mb-6">Suporte</h3>
              <ul className="space-y-3 md:space-y-4 text-white/80 text-sm font-light">
                <li><Link href="/help" className="hover:text-white transition-colors">Central de Ajuda</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link></li>
              </ul>
            </div>

            {/* Redes sociais: Ocupa linha inteira no mobile (col-span-2) */}
            <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start mt-4 md:mt-0">
              <span className="text-white font-medium text-xs tracking-[0.3em] uppercase mb-4 md:mb-6 text-center md:text-left">
                Acompanhe nas redes
              </span>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com/theinovalabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-[#572B8B] transition-all duration-300 group"
                >
                  <Instagram size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 md:pt-8 flex flex-col items-center justify-center text-center">
          <p className="text-white/60 text-xs md:text-sm font-light">
            &copy; 2026 DoeCerto. Todos os direitos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
}