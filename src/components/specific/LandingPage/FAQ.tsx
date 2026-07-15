"use client";
import { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "Como as ONGs são avaliadas?",
    answer: "Nossa equipe administrativa exige o CNPJ, estatuto social e comprovantes de atuação. Somente após a verificação manual, a ONG recebe o Selo DoeCerto e fica visível no aplicativo."
  },
  {
    question: "Posso doar materiais ou apenas dinheiro?",
    answer: "Você pode doar ambos! As ONGs podem criar uma 'Wishlist' pedindo itens específicos, como alimentos ou roupas, além de receberem doações financeiras seguras via Pix."
  },
  {
    question: "O DoeCerto cobra alguma taxa?",
    answer: "Não. O DoeCerto é uma ponte gratuita. Quando você doa via Pix, o valor cai diretamente na conta bancária verificada da ONG."
  },
  {
    question: "Quem pode realizar doações pelo DoeCerto?",
    answer: "Qualquer pessoa física ou jurídica que queira fazer a diferença. O ecossistema é totalmente digital, intuitivo e seguro, permitindo que você apoie uma causa em segundos de onde estiver."
  },
  {
    question: "Meus dados estão seguros na plataforma?",
    answer: "Absolutamente. O DoeCerto adota padrões rigorosos de segurança digital (LGPD) para proteger suas informações pessoais. Além disso, as doações via Pix são intermediadas pelo seu próprio banco, garantindo uma transação criptografada e totalmente segura."
  },
  {
    question: "Recebo algum comprovante após realizar a doação?",
    answer: "Sim! Assim que a transação via Pix é confirmada, você recebe um recibo digital de doação que fica salvo no seu histórico dentro da plataforma. É a sua garantia e transparência de que a ajuda chegou exatamente onde deveria."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%", 
        toggleActions: "play none none reverse", 
      }
    });

    tl.fromTo(".faq-title", { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" })
      .fromTo(".faq-item", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.2, stagger: 0.1, ease: "power2.out" }, "-=0.4");
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="faq-title text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12">
          Perguntas Frequentes
        </h2>

        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-5 md:px-6 py-4 md:py-5 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {/* Fonte levemente menor no mobile para não quebrar tantas linhas */}
                <span className="font-semibold text-gray-900 text-base md:text-lg pr-4">{faq.question}</span>
                <span className="text-[#6B21A8] text-2xl font-light shrink-0">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>

              <div className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 md:max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="px-5 md:px-6 py-4 md:py-5 text-gray-600 text-sm md:text-base">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}