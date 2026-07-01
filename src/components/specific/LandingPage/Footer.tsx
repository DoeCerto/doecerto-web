import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#572B8B] pt-24 pb-8">
      {/* Aqui tiramos o max-w-6xl e colocamos um padding lateral dinâmico para espalhar mais o conteúdo */}
      <div className="w-full px-8 lg:px-[8vw] mx-auto max-w-[1600px]">

        {/* Parte Superior do Footer */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-16">

          {/* Coluna 1: Logo e Descrição */}
          <div className="max-w-md">
            <div className="mb-6">
              {/* Ajustamos para um retângulo (w-48 e h-10) em vez de um quadrado */}
              <div className="relative w-48 h-10">
                <Image
                  src="/logo.svg"
                  alt="Logo DoeCerto"
                  fill
                  // O object-left garante que a logo não fique centralizada no meio do espaço, mas alinhada com o texto
                  className="object-contain object-left"
                />
              </div>
            </div>

            <p className="text-white/80 text-sm font-light leading-relaxed">
              Tecnologia de ponta para tornar suas doações mais eficientes, seguras e impactantes. Ajudamos a conectar corações dispostos a mudar o mundo.
            </p>
          </div>
          {/* Colunas da Direita (Links e Redes - agora com mais espaço entre elas) */}
          <div className="flex flex-wrap gap-16 lg:gap-28">

            {/* Plataforma */}
            <div>
              <h3 className="text-white font-semibold mb-6">Plataforma</h3>
              <ul className="space-y-4 text-white/80 text-sm font-light">
                <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Cadastre-se</Link></li>
                <li><Link href="/ongs" className="hover:text-white transition-colors">Catálogo de ONGs</Link></li>
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h3 className="text-white font-semibold mb-6">Suporte</h3>
              <ul className="space-y-4 text-white/80 text-sm font-light">
                <li><Link href="/help" className="hover:text-white transition-colors">Central de Ajuda</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link></li>
              </ul>
            </div>

            {/* Acompanhe nas Redes */}
            <div className="flex flex-col">
              <span className="text-white font-medium text-xs tracking-[0.3em] uppercase mb-6">
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

        {/* Linha Divisória Inferior */}
        <div className="border-t border-white/20 pt-8 flex items-center justify-between">
          <p className="text-white/60 text-xs font-light">
            &copy; 2026 DoeCerto. Todos os direitos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
}