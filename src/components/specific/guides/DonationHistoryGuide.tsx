"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MoveRight, User, Star, Heart, Check } from "lucide-react";

import StepHeader from "@/components/ui/StepHeader";
import StepIntro from "@/components/ui/StepIntro";
import NextButton from "@/components/ui/NextButton";
import BackButton from "@/components/ui/BackButton";
import { FiSearch, FiChevronLeft } from "react-icons/fi";

/* =========================
   CARD PADRÃO
========================= */

function DefaultCard({ step }: any) {
  return (
    <div className=" 
    w-full 
    bg-white 
    border 
    border-[#6B39A7] 
    rounded-[20px] 
    mt-[20px]
    mb-[30px]
    p-[15px] 
    shadow-[0px_8px_16px_rgba(0,0,0,0.12)]
    flex
    flex-col
    items-center
      ">

      <div className="w-full flex flex-row justify-between items-center">

        <div>
          <Image src="/logo_roxa.svg" alt="DoeCerto" width={125} height={125} priority />
        </div>

        <div className="flex flex-row items-center">
          <MoveRight className="w-[35px] h-[30px] text-[#6B39A7]" />

          <div className="bottom-0 border border-[#6B39A7] rounded-full w-[35px] h-[35px] flex justify-center items-center">
            <User className="w-[30px] h-[25px] text-[#6B39A7]" />
          </div>

        </div>
      </div>

      <div className="mt-[15px] mb-[10px] w-full flex items-center gap-3 bg-white shadow-sm rounded-xl px-3 py-2">
        <FiSearch className="text-gray-400" />
        <input
          placeholder="Pesquise uma ONG, cidade ou causa"
          className="w-full outline-none text-sm"
        />
      </div>

      <div className="w-full flex flex-row gap-3">

        <div className="justify-start rounded-[20px] shadow-sm py-[2px] px-[10px] flex justify-center items-center">
          <p>Proteção Animal</p>
        </div>

        <div className="justify-start rounded-[20px] shadow-sm py-[2px] px-[10px] flex justify-center items-center">
          <p>Saúde</p>
        </div>

        <div className="justify-start rounded-[20px] shadow-sm py-[2px] px-[10px] flex justify-center items-center">
          <p>Moradia</p>
        </div>

      </div>

      <div className="w-full flex flex-col mt-[20px]">
        <div>
          <h1 className="font-semibold font-[16px]">Melhores Avaliadas</h1>
        </div>

        <div className="flex flex-row gap-4">

          <div className="shadow-sm flex flex-col items-center rounded-[10px]">
            <div>
              <Image src="/frame_22.svg" alt="ONG" width={127} height={72} priority />
            </div>
            <div className="flex flex-col w-full p-[10px]">
              <div className="flex flex-row gap-[10px]">
                <p className="text-[16px] font-semibold">SOS Gatinhos</p>
                <div className="flex flex-row justify-center items-center gap-1">
                  <Star className="w-3 h-3 text-[#FFC600] fill-[#FFC600] border-none" />
                  <p className="font-[8px] text-[14px] text-[#FF7B00]">5.0</p>
                </div>
              </div>

              <div className="flex flex-row gap-1 mt-[5px]">
                <div className="w-fit rounded-[20px] bg-[#EBD2FF] shadow-sm px-[10px]">
                  <p className="text-[14px] text-[#6B39A7] font-semibold">
                    Animal
                  </p>
                </div>
                <p className="text-[14px] text-[#666666]">+1</p>
              </div>

              <div>
                <p className="text-[14px] text-[#666666]">1.4 km</p>
              </div>
              <div className="w-full mt-[8px] rounded-[8px] font-semibold bg-[#6B39A7] flex justify-center items-center text-white">Doar</div>
            </div>
          </div>

          <div className="shadow-sm flex flex-col items-center rounded-[10px]">
            <div>
              <Image src="/frame_22.svg" alt="ONG" width={127} height={72} priority />
            </div>
            <div className="flex flex-col w-full p-[10px]">
              <div className="flex flex-row gap-[10px]">
                <p className="text-[16px] font-semibold">SOS Gatinhos</p>
                <div className="flex flex-row justify-center items-center gap-1">
                  <Star className="w-3 h-3 text-[#FFC600] fill-[#FFC600] border-none" />
                  <p className="font-[8px] text-[14px] text-[#FF7B00]">5.0</p>
                </div>
              </div>

              <div className="flex flex-row gap-1 mt-[5px]">
                <div className="w-fit rounded-[20px] bg-[#EBD2FF] shadow-sm px-[10px]">
                  <p className="text-[14px] text-[#6B39A7] font-semibold">
                    Meio Ambiente</p>
                </div>
                <p className="text-[14px] text-[#666666]">+2</p>
              </div>

              <div>
                <p className="text-[14px] text-[#666666]">1.4 km</p>
              </div>
              <div className="w-full mt-[8px] rounded-[8px] font-semibold bg-[#6B39A7] flex justify-center items-center text-white">Doar</div>
            </div>
          </div>
        </div>

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
        mt-[20px]
        mb-[30px]
        shadow-[0px_8px_16px_rgba(0,0,0,0.12)]
        flex
        flex-col
        overflow-hidden
      "
    >
      <div className="flex flex-row gap-[16px] w-full bg-[#6B39A7] border border-[#6B39A7] p-[15px]">

        <div className="w-[45px] h-[45px] rounded-full bg-white flex justify-center items-center">
          <User className="w-[35px] h-[30px] text-[#6B39A7]" />
        </div>

        <div>
          <div className="text-[20px] font-semibold text-white">
            <h2>Felipe Romero</h2>
          </div>
          <div className="text-[14px] font-semibold text-white -mt-2">
            <p>felipe@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="px-[15px] py-[20px] gap-[8px] flex flex-col">
        <div className="rounded-[10px] border-5 border-[#6B39A7] p-[15px] flex flex-row gap-[10px] items-center">

          <div className="w-[40px] h-[40px] bg-[#EBD2FF] rounded-[10px] flex items-center justify-center">1</div>

          <div>
            <div className="text-[20px] font-semibold ">
              <h2>Ver histórico de doações</h2>
            </div>
            <div className="text-[14px] font-regular -mt-2">
              <p>Tudo que você já doou</p>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] shadow-sm p-[15px] flex flex-row gap-[10px] items-center">

          <div className="w-[40px] h-[40px] bg-[#EBD2FF] rounded-[10px] flex items-center justify-center">1</div>

          <div>
            <div className="text-[20px] font-semibold ">
              <h2>Avaliar uma ONG</h2>
            </div>
            <div className="text-[14px] font-regular -mt-2">
              <p>Comentários e estrelas</p>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] shadow-sm p-[15px] flex flex-row gap-[10px] items-center">

          <div className="w-[40px] h-[40px] bg-[#EBD2FF] rounded-[10px] flex items-center justify-center">1</div>

          <div>
            <div className="text-[20px] font-semibold ">
              <h2>Minha Conta</h2>
            </div>
            <div className="text-[14px] font-regular -mt-2">
              <p>Dados e preferênciais</p>
            </div>
          </div>
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
        mt-[20px]
        mb-[30px]
        shadow-[0px_8px_16px_rgba(0,0,0,0.12)]
      "
    >
      <div className="p-[15px] flex flex-col gap-[25px]">

        <div className="flex flex-row gap-[10px] items-center">
          <div className="w-[35px] h-[35px] bg-[#EBD2FF] rounded-full flex justify-center items-center">
            <FiChevronLeft className="w-[35px] h-[25px] text-[#6B39A7]"/>
          </div>
          <div className="font-extrabold text-[20px]">
            <p>Histórico de doações</p>
          </div>
        </div>


        <div className="flex flex-col gap-[5px]">
          <div className="flex flex-row rounded-[10px] shadow-sm p-[12px] items-center justify-between">

            <div className="flex flex-row">
              <div className="w-[42px] h-[42px] bg-[#EBD2FF] rounded-full mr-[13px]"></div>

              <div>
                <div className="text-[20px] font-semibold ">
                  <h2>SOS Gatinhos</h2>
                </div>
                <div className="text-[14px] font-regular -mt-2">
                  <p>13 abr - Pix</p>
                </div>
              </div>
            </div>

            <div className="w-fit">
              <div className="text-[20px] text-[#6B39A7] font-bold ">
                <h2>R$50,00</h2>
              </div>
              <div className="-mt-1 bg-[#08A60C] rounded-[10px] px-[7px] flex justify-center items-center">
                <p className="text-[14px] font-semibold">Concluído</p>
              </div>
            </div>
          </div>

          <div className="flex flex-row rounded-[10px] shadow-sm p-[12px] items-center justify-between">

            <div className="flex flex-row">
              <div className="w-[42px] h-[42px] bg-[#EBD2FF] rounded-full mr-[13px]"></div>

              <div>
                <div className="text-[20px] font-semibold ">
                  <h2>SOS Gatinhos</h2>
                </div>
                <div className="text-[14px] font-regular -mt-2">
                  <p>13 abr - Pix</p>
                </div>
              </div>
            </div>

            <div className="w-fit">
              <div className="text-[20px] text-[#6B39A7] font-bold ">
                <h2>R$50,00</h2>
              </div>
              <div className="-mt-1 bg-[#08A60C] rounded-[10px] px-[7px] flex justify-center items-center">
                <p className="text-[14px] font-semibold">Concluído</p>
              </div>
            </div>
          </div>

          <div className="flex flex-row rounded-[10px] shadow-sm p-[12px] items-center justify-between">

            <div className="flex flex-row">
              <div className="w-[42px] h-[42px] bg-[#EBD2FF] rounded-full mr-[13px]"></div>

              <div>
                <div className="text-[20px] font-semibold ">
                  <h2>SOS Gatinhos</h2>
                </div>
                <div className="text-[14px] font-regular -mt-2">
                  <p>13 abr - Pix</p>
                </div>
              </div>
            </div>

            <div className="w-fit">
              <div className="text-[20px] text-[#6B39A7] font-bold ">
                <h2>R$50,00</h2>
              </div>
              <div className="-mt-1 bg-[#08A60C] rounded-[10px] px-[7px] flex justify-center items-center">
                <p className="text-[14px] font-semibold">Concluído</p>
              </div>
            </div>
          </div>

          <div className="flex flex-row rounded-[10px] shadow-sm p-[12px] items-center justify-between">

            <div className="flex flex-row">
              <div className="w-[42px] h-[42px] bg-[#EBD2FF] rounded-full mr-[13px]"></div>

              <div>
                <div className="text-[20px] font-semibold ">
                  <h2>SOS Gatinhos</h2>
                </div>
                <div className="text-[14px] font-regular -mt-2">
                  <p>13 abr - Pix</p>
                </div>
              </div>
            </div>

            <div className="w-fit">
              <div className="text-[20px] text-[#6B39A7] font-bold ">
                <h2>R$50,00</h2>
              </div>
              <div className="-mt-1 bg-[#08A60C] rounded-[10px] px-[7px] flex justify-center items-center">
                <p className="text-[14px] font-semibold">Concluído</p>
              </div>
            </div>
          </div>
        </div>

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
        mt-[20px]
        pt-[40px]
        px-[25px]
        pb-[28px]
        mb-[30px]
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
          {step.icon}
        </div>

        <h1 className="font-semibold text-[24px] mt-[3px] text-center">
          {step.titleCard}
        </h1>

        <p className="text-[16px] text-center text-[#6B39A7] mb-[25px]">
          {step.titleDescription}
        </p>

        <div className="gap-2 w-full flex flex-col">
          <div className="rounded-[10px] py-[10px] px-[20px] border border-[#6B39A7] text-[16px] font-extrabold bg-[#EBD2FF]">
            {step.labelCard1}
            <div className="flex flex-row justify-between items-center">
              <div className="bg-white py-[5px] px-[10px] w-[35%] rounded-[10px] flex justify-center items-center border border-[#6B39A7]">
                <p className="font-semibold text-[16px]">{step.itensCard1}</p>
              </div>

              <div className="gap-2 flex flex-row justify-center items-center">
                <div className="bg-white rounded-[10px] max-h-[20px] px-[7px] py-[10px] border border-[#6B39A7] flex items-center justify-center">
                  <div className="w-[12px] h-[3px] bg-[#6B39A7] rounded-full"></div>
                </div>
                <p className="text-[16px] font-extrabold">2</p>
                <div className="bg-white rounded-[10px] max-h-[20px] px-[7px] py-[10px] border border-[#6B39A7] flex items-center justify-center">
                  <div className="relative w-[10px] h-[10px]">
                    <div className="absolute top-1/2 left-0.10 -translate-y-1/2 w-[10px] h-[2px] bg-[#6B39A7] rounded-full"></div>

                    <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[2px] h-[10px] bg-[#6B39A7] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>


          <div className="mt-[10px] rounded-[10px] w-full border border-[#6B39A7] py-[10px] flex justify-center items-center">
            <div className="flex flex-row justify-center items-center gap-4">
              <div className="relative w-[20px] h-[20px] flex justify-center items-center">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[3px] bg-[#6B39A7] rounded-full"></div>

                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[3px] h-full bg-[#6B39A7] rounded-full"></div>
              </div>
              <p className="font-semibold text-[20px] text-[#6B39A7]">{step.buttonAdd}</p>
            </div>
          </div>
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
        mt-[20px]
        pt-[40px]
        px-[25px]
        pb-[28px]
        mb-[30px]
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
          {step.icon}
        </div>

        <h1 className="font-semibold text-[24px] text-[#6B39A7] mt-[3px] text-center">
          {step.confirmDonation}
        </h1>

        <p className="text-[16px] text-center mb-[25px]">
          {step.confirmOrganization}
        </p>

        <div className="flex flex-col border border-[#6B39A7] bg-[#EBD2FF] rounded-[14px] w-full py-[15px] px-[30px]">
          <div className="flex flex-row justify-between">
            <p className="text-[16px]">Para</p>
            <p className="font-semibold text-[#6B39A7] text-[16px]">{step.to}</p>
          </div>
          <div className="flex flex-row justify-between">
            <p className="text-[16px]">Valor</p>
            <p className="font-semibold text-[#6B39A7] text-[16px]">{step.value}</p>
          </div>
          <div className="flex flex-row justify-between">
            <p className="text-[16px]">Método</p>
            <p className="font-semibold text-[#6B39A7] text-[16px]">{step.method}</p>
          </div>
          <div className="flex flex-row justify-between">
            <p className="text-[16px]">Data</p>
            <p className="font-semibold text-[#6B39A7] text-[16px]">{step.date}</p>
          </div>
        </div>
        <div className="mt-[20px]">
          <p className="text-[16px] text-center text-[#6B39A7]">{step.confirmDescription}</p>
        </div>
      </div>


    </div>
  );
}

export default function DonationHistoryGuide() {
  const router = useRouter();

  const steps = [
    {
      id: 1,
      label: "Passo 1",
      labelClassName: "bg-[#EBD2FF] px-[10px] rounded-[20px]",
      title: "Acesse seu Perfil",
      description:
        "Toque no seu avatar no canto superior direito da home",
    },

    {
      id: 2,
      label: "Passo 2",
      labelClassName: "bg-[#EBD2FF] px-[10px] rounded-[20px]",
      title: "Toque em ver Histórico",
      description:
        "No seu perfil, toque em \"Ver histórico de doações\" ",
    },

    {
      id: 3,
      label: "Passo 3",
      labelClassName: "bg-[#EBD2FF] px-[10px] rounded-[20px]",
      title: "Seu Histórico completo",
      description:
        "Veja todas as doações, datas e valores em um só lugar",
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
    <div className="w-full min-h-screen px-[25px] py-[10px] flex flex-col items-center">
      <StepHeader
        currentStep={step.id}
        totalSteps={steps.length}
        onSkip={() => router.push("/help-center")}
      />

      <main className="grid grid-cols-1 lg:grid-cols-2 lg:gap-20 lg:flex-1 lg:items-center">

        {/* CARD DINÂMICO */}
        <div className="w-full lg:flex-1">
          <CurrentCard step={step} />
        </div>

        {/* Intro */}
        <div className="lg:max-w-none lg:h-[400px] flex flex-col lg:justify-center items-center">
          <StepIntro
            label={step.label ?? ""}
            labelClassName={step.labelClassName}
            title={typeof step.title === "string" ? step.title : ""}
            description={step.description ?? ""}
          />

          {/* Indicators */}
          <div className="flex justify-center flex-col lg:mt-auto mt-8">
            <div className="mb-6 flex justify-center gap-[5px]">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-[10px] rounded-full transition-all duration-300 ${currentStep === index
                    ? "w-[24px] bg-[#6B39A7]"
                    : "w-[10px] bg-[#D9B8F5]"
                    }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-[15px] pb-2">
              {currentStep > 0 && (
                <BackButton onClick={handleBack} />
              )}

              <NextButton
                onClick={handleNext}
                text={currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
                isFinish={currentStep === steps.length - 1}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}