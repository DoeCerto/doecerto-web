import StepHeader from "@/components/ui/StepHeader";

export default function DonationGuide() {
  return (
    <main className="p-[25px]">
      <StepHeader 
      currentStep={1}
      totalSteps={5}
      />

      <div className="w-full bg-white border border-[#6B39A7] rounded-[20px] mt-[30px] pt-[45px] px-[30px] pb-[33px] shadow-[0px_8px_16px_rgba(0,0,0,0.12)] flex flex-col items-center">

        <div className="w-[60px] h-[60px] bg-[#EBD2FF] rounded-full flex items-center justify-center">3</div>

        <h1 className="font-semibold text-[32px] mt-[3px]">SOS Gatinhos</h1>

        <p className="text-[16px] font-normal -translate-y-[8px] mb-[15px]">Resgate e cuidados de gatos abandonados</p>

        <hr className="border border-t border-[#3D3D3D] w-full h-[1px]"></hr>
      </div>
    </main>
  );
}