"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Barcode } from "lucide-react";

import StepHeader from "@/components/ui/StepHeader";
import StepIntro from "@/components/ui/StepIntro";
import NextButton from "@/components/ui/NextButton";
import BackButton from "@/components/ui/BackButton";

import { Star } from "lucide-react";

/* =========================
   CARD PADRÃO
========================= */

function DefaultCard({ step }: any) {
  return (
    <div
      className="
        w-full
        bg-white
        border
        border-[#6B39A7]
        rounded-[20px]
        mt-[30px]
        pt-[45px]
        px-[30px]
        pb-[33px]
        mb-[25px]
        shadow-[0px_8px_16px_rgba(0,0,0,0.12)]
        flex
        flex-col
        items-center
      "
    >
      <div
        className="
          w-[60px]
          h-[60px]
          bg-[#EBD2FF]
          rounded-full
          flex
          items-center
          justify-center
        "
      >
        {step.id}
      </div>

      <h1 className="font-semibold text-[32px] mt-[3px] text-center">
        {step.organization}
      </h1>

      <p
        className="
          text-[16px]
          font-normal
          -translate-y-[8px]
          mb-[10px]
          text-center
        "
      >
        {step.organizationDescription}
      </p>

      <hr className="border border-[#3D3D3D] w-full h-[1px]" />

      {/* Stats */}
      <div
        className="
          w-full
          flex
          flex-row
          justify-between
          mb-[20px]
          mt-[20px]
          px-[10px]
        "
      >
        <div className="flex flex-col items-center">
          <h1 className="text-[32px] font-bold">
            {step.donors}
          </h1>

          <p className="text-[16px] font-normal -translate-y-[8px]">
            Doadores
          </p>
        </div>

        <div className="flex flex-col items-center">
          <h1 className="text-[32px] font-bold">
            {step.rescues}
          </h1>

          <p className="text-[16px] font-normal -translate-y-[8px]">
            Resgates
          </p>
        </div>

        <div className="flex flex-col items-center">
          <h1
            className="
              flex
              flex-row
              items-center
              gap-1
              text-[32px]
              font-bold
            "
          >
            {step.rating}

            <Star className="w-[25px] h-[25px] fill-[#000000]" />
          </h1>

          <p className="text-[16px] font-normal -translate-y-[8px]">
            Avaliação
          </p>
        </div>
      </div>

      {/* Button */}
      <div
        className="
          mx-[5px]
          py-[18px]
          bg-[#6B39A7]
          text-white
          text-[16px]
          font-bold
          w-full
          rounded-[10px]
          flex
          justify-center
          items-center
        "
      >
        {step.buttonText}
      </div>
    </div>
  );
}

/* =========================
   CARD STEP 2
========================= */

function DonationTypeCard({ step }: any) {
  return (
    <div
      className="
        w-full
        bg-white
        border
        border-[#6B39A7]
        rounded-[20px]
        mt-[30px]
        pt-[45px]
        px-[30px]
        pb-[33px]
        mb-[25px]
        shadow-[0px_8px_16px_rgba(0,0,0,0.12)]
        flex
        flex-col
        items-center
      "
    >
      <div
        className="
          w-[60px]
          h-[60px]
          bg-[#EBD2FF]
          rounded-full
          flex
          items-center
          justify-center
        "
      >
        {step.id}
      </div>

      <h1 className="font-semibold text-[32px] mt-[3px] text-center">
        {step.organization}
      </h1>

      <p
        className="
          text-[16px]
          font-normal
          -translate-y-[8px]
          mb-[20px]
          text-center
        "
      >
        {step.organizationDescription}
      </p>

      <div className="w-full flex flex-col gap-4">
        <div
          className="
            border
            border-[#6B39A7]
            bg-[#EBD2FF]
            rounded-[14px]
            p-[18px]
            flex
            flex-row
            justify-between
            items-center
          "
        >
          <div className="flex flex-row gap-2 items-center">
            <div className="p-[5px] flex items-center justify-center rounded-[5px] bg-[#FFFFFF]">
              💰
            </div>

            <div>
              <h2 className="text-[20px] font-bold text-[#6B39A7]">
                {step.money}
              </h2>

              <p className="text-[14px] text-[#5F5F5F]">
                {step.DescribeMoney}
              </p>
            </div>
          </div>

          <div className="rounded-full p-[5px] w-[15px] h-[15px] flex justify-center items-center bg-[#6B39A7]">
            <div className="rounded-full w-[6px] h-[6px] bg-white"></div>
          </div>
        </div>

        <div
          className="
            border
            border-[#EBD2FF]
            rounded-[14px]
            p-[18px]
            flex
            flex-row
            justify-between
            items-center
          "
        >
          <div className="flex flex-row gap-2 items-center">
            <div className="p-[5px] flex items-center justify-center rounded-[5px] bg-[#EBD2FF] text-white">
              📦
            </div>

            <div>
              <h2 className="text-[20px] font-bold text-[#6B39A7]">
                {step.items}
              </h2>

              <p className="text-[14px] text-[#5F5F5F]">
                {step.DescribeItems}
              </p>
            </div>
          </div>

          <div className="border border-[#6B39A7] rounded-full p-[5px] w-[15px] h-[15px] flex justify-center items-center"></div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   CARD STEP 3
========================= */

function ReviewCard({ step }: any) {
  return (
    <div
      className="
        w-full
        bg-white
        border
        border-[#6B39A7]
        rounded-[20px]
        mt-[30px]
        pt-[45px]
        px-[25px]
        pb-[33px]
        mb-[25px]
        shadow-[0px_8px_16px_rgba(0,0,0,0.12)]
        flex
        flex-col
        items-center
      "
    >
      <div className="flex flex-col items-center">
        <div
          className="
            w-[60px]
            h-[60px]
            bg-[#EBD2FF]
            rounded-full
            flex
            items-center
            justify-center
          "
        >
          {step.id}
        </div>

        <h1 className="font-semibold text-[32px] mt-[3px] text-center">
          {step.money}
        </h1>

        <p className="text-[16px] text-center mb-[20px] font-normal
          -translate-y-[8px]">
          {step.organizationDescription}
        </p>
      </div>

      <div className="w-full flex flex-row gap-4 justify-center">
        <div
          className="
                w-full 
                border 
                border-[#6B39A7] 
                bg-[#EBD2FF] 
                flex 
                flex-col 
                items-center 
                justify-center 
                p-[15px] 
                rounded-[14px]
              "
        >
          <h1 className="font-semibold text-[32px] text-[#6B39A7]">{step.titleCard1}</h1>
          <p className="text-[#6B39A7] -translate-y-[8px]">{step.descriptionCard1}</p>
        </div>

        <div
          className="
              w-full
              border
              border-[#6B39A7]
              flex
              flex-col
              items-center
              justify-center
              py-[5px]
              px-[15px]
              rounded-[14px]
            "
        >
          <h1 className="font-semibold text-[30px] text-[#6B39A7]">
            {step.titleCard2}
          </h1>

          <div className="text-[#6B39A7] mt-[5px] -translate-y-[15px]">
            <svg
              width="55"
              height="32"
              viewBox="0 0 55 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="2" y="4" width="2" height="24" fill="currentColor" />
              <rect x="6" y="4" width="1" height="24" fill="currentColor" />
              <rect x="9" y="4" width="3" height="24" fill="currentColor" />
              <rect x="14" y="4" width="2" height="24" fill="currentColor" />
              <rect x="18" y="4" width="4" height="24" fill="currentColor" />
              <rect x="24" y="4" width="1" height="24" fill="currentColor" />
              <rect x="27" y="4" width="3" height="24" fill="currentColor" />
              <rect x="32" y="4" width="2" height="24" fill="currentColor" />
              <rect x="36" y="4" width="5" height="24" fill="currentColor" />
              <rect x="43" y="4" width="1" height="24" fill="currentColor" />
              <rect x="46" y="4" width="3" height="24" fill="currentColor" />
              <rect x="51" y="4" width="2" height="24" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-4 py-[18px] text-white rounded-[10px] w-full bg-[#6B39A7] flex justify-center items-center">
        <p className="font-bold font-[16px]">{step.buttonText}</p>
      </div>
    </div>
  );
}

/* =========================
   CARD STEP 4
========================= */

function SuccessCard({ step }: any) {
  return (
    <div
      className="
        w-full
        bg-white
        border
        border-[#6B39A7]
        rounded-[20px]
        mt-[30px]
        pt-[45px]
        px-[30px]
        pb-[33px]
        mb-[25px]
        shadow-[0px_8px_16px_rgba(0,0,0,0.12)]
      "
    >
      <div className="flex flex-col items-center">
        <div
          className="
            w-[60px]
            h-[60px]
            bg-[#EBD2FF]
            rounded-full
            flex
            items-center
            justify-center
          "
        >
          {step.id}
        </div>

        <h1 className="font-semibold text-[32px] mt-[3px] text-center">
          {step.organization}
        </h1>

        <p className="text-[16px] text-center mb-[25px]">
          {step.organizationDescription}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-[#F8F4FC] p-[16px] rounded-[14px]">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-[18px] h-[18px] fill-black" />
            <span className="font-bold">4.9</span>
          </div>

          <p className="text-[14px]">
            "Projeto incrível! Meu dinheiro realmente ajudou."
          </p>
        </div>

        <div className="bg-[#F8F4FC] p-[16px] rounded-[14px]">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-[18px] h-[18px] fill-black" />
            <span className="font-bold">5.0</span>
          </div>

          <p className="text-[14px]">
            "Muito transparente e confiável."
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================
   CARD STEP 5
========================= */

function FinishCard({ step }: any) {
  return (
    <div
      className="
        w-full
        bg-white
        border
        border-[#6B39A7]
        rounded-[20px]
        mt-[30px]
        pt-[45px]
        px-[30px]
        pb-[33px]
        mb-[25px]
        shadow-[0px_8px_16px_rgba(0,0,0,0.12)]
      "
    >
      <div className="flex flex-col items-center">
        <div
          className="
            w-[60px]
            h-[60px]
            bg-[#EBD2FF]
            rounded-full
            flex
            items-center
            justify-center
          "
        >
          {step.id}
        </div>

        <h1 className="font-semibold text-[32px] mt-[3px] text-center">
          {step.organization}
        </h1>

        <p className="text-[16px] text-center mb-[25px]">
          {step.organizationDescription}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-[#F8F4FC] p-[16px] rounded-[14px]">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-[18px] h-[18px] fill-black" />
            <span className="font-bold">4.9</span>
          </div>

          <p className="text-[14px]">
            "Projeto incrível! Meu dinheiro realmente ajudou."
          </p>
        </div>

        <div className="bg-[#F8F4FC] p-[16px] rounded-[14px]">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-[18px] h-[18px] fill-black" />
            <span className="font-bold">5.0</span>
          </div>

          <p className="text-[14px]">
            "Muito transparente e confiável."
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DonationGuide() {
  const router = useRouter();

  const steps = [
    {
      id: 1,
      organization: "SOS Gatinhos",
      organizationDescription:
        "Resgate e cuidados de gatos abandonados",

      donors: "423",
      rescues: "1.2K",
      rating: "4.9",

      buttonText: "Doar para SOS Gatinhos",

      label: "ENCONTRE E AJUDE",

      title: "Encontre uma ONG e toque em Doar",

      description:
        "Cada ONG tem seu botão de doação na página de perfil",
    },

    {
      id: 2,
      organization: "Sos Gatinhos",
      organizationDescription:
        "Como você quer ajudar?",

      money: "Dinheiro",
      DescribeMoney: "Pix ou boleto - rápido e seguro",

      items: "Itens",
      DescribeItems: "Ração, roupas e mais",

      label: "VOCÊ DECIDE COMO AJUDAR",

      title: (
        <>
          Escolha o tipo de <br />
          doação
        </>
      ),

      description:
        "Doe dinheiro ou itens físicos - do jeito que for melhor pra você",
    },

    {
      id: 3,
      money: "R$ 50,00",
      organizationDescription:
        "para SOS Gatinhos",

      titleCard1: "Pix",
      descriptionCard1:
        "Instantâneo",

      titleCard2: "Boleto",

      buttonText: "Confirmar Doação",

      label: "RÁPIDO E SEGURO",

      title: "Doe em segundos com Segurança",

      description:
        "Pix ou boleto. Recibo e confirmação chega na hora.",
    },

    {
      id: 4,
      organization: "Casa Esperança",
      organizationDescription:
        "Ajuda para famílias em vulnerabilidade",

      label: "AVALIAÇÕES",

      title: (
        <>
          Veja comentários e <br />
          avaliações reais
        </>
      ),

      description:
        "Descubra como outras pessoas avaliam cada ONG",
    },

    {
      id: 5,
      organization: "Casa Esperança",
      organizationDescription:
        "Ajuda para famílias em vulnerabilidade",

      label: "AVALIAÇÕES",

      title: (
        <>
          Veja comentários e <br />
          avaliações reais
        </>
      ),

      description:
        "Descubra como outras pessoas avaliam cada ONG",
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];

  /* =========================
     MAPEAMENTO DOS CARDS
  ========================= */

  const cardComponents: Record<number, any> = {
    1: DefaultCard,
    2: DonationTypeCard,
    3: ReviewCard,
    4: SuccessCard,
    5: FinishCard,
  };

  const CurrentCard = cardComponents[step.id] || DefaultCard;

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/help-center");
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  return (
    <div className="px-[25px] py-[10px] flex flex-col items-center">
      <StepHeader
        currentStep={step.id}
        totalSteps={steps.length}
        onSkip={() => router.push("/help-center")}
      />

      <main className="w-full max-w-[430px] flex flex-col min-h-screen">

        {/* CARD DINÂMICO */}
        <CurrentCard step={step} />

        {/* Intro */}
        <StepIntro
          label={step.label ?? ""}
          title={typeof step.title === "string" ? step.title : ""}
          description={step.description ?? ""}
        />

        {/* Buttons */}
        <div className="pt-[20px] mt-auto flex justify-center gap-[15px]">
          {currentStep > 0 && (
            <BackButton onClick={handleBack} />
          )}

          <NextButton onClick={handleNext} />
        </div>
      </main>
    </div>
  );
}