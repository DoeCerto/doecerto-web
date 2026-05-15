import StepHeader from "@/components/ui/StepHeader";
import StepIntro from "@/components/ui/StepIntro";
import NextButton from "@/components/ui/NextButton";
import { Star } from "lucide-react";

export default function DonationGuide() {
  return (
    <main className="p-[25px]">
      <StepHeader
        currentStep={1}
        totalSteps={5}
      />

      <div className="w-full bg-white border border-[#6B39A7] rounded-[20px] mt-[30px] pt-[45px] px-[30px] pb-[33px] mb-[25px] shadow-[0px_8px_16px_rgba(0,0,0,0.12)] flex flex-col items-center">

        <div className="w-[60px] h-[60px] bg-[#EBD2FF] rounded-full flex items-center justify-center">3</div>

        <h1 className="font-semibold text-[32px] mt-[3px]">SOS Gatinhos</h1>

        <p className="text-[16px] font-normal -translate-y-[8px] mb-[10px]">Resgate e cuidados de gatos abandonados</p>

        <hr className="border border-t border-[#3D3D3D] w-full h-[1px] mb-[px]"></hr>

        <div className="w-full flex flex-row justify-between mb-[20px]
        mx-[10px]">

          <div className="flex flex-col items-center">
            <h1 className="text-[32px] font-bold">
              423
            </h1>
            <p className="text-[16px] font-normal -translate-y-[8px]">Doadores</p>
          </div>

          <div className="flex flex-col items-center">
            <h1 className="text-[32px] font-bold">
              1.2K
            </h1>
            <p className="text-[16px] font-normal -translate-y-[8px]">Resgates</p>
          </div>

          <div className="flex flex-col items-center">
            <h1 className="flex flex-row items-center text-[32px] font-bold">
              4.9 <Star className="w-[30px] h-[30px] fill-[#000000]" />
            </h1>
            <p className="text-[16px] font-normal -translate-y-[8px]">Avaliação</p>
          </div>
        </div>

        <div className="mx-[5px] py-[18px] bg-[#6B39A7] text-[#FFFFFF]
        text-[16px] font-bold w-full rounded-[10px] flex justify-center items-center">
          Doar para SOS Gatinhos
        </div>
      </div>

      <StepIntro 
          label="ENCONTRE E AJUDE"
          title="Encontre uma ONG e toque em Doar"
          description="Cada ONG tem seu botão de doação na página de perfil"
      />
      <NextButton onClick={() => console.log("Próxima etapa")} />
    </main>
  );
}