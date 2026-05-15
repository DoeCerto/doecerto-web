"use client";

type StepHeaderProps = {
  currentStep: number;
  totalSteps: number;
  onSkip?: () => void;
};

export default function StepHeader({
  currentStep,
  totalSteps,
  onSkip,
}: StepHeaderProps) {
  return (
    <div className="w-full flex items-center justify-between bg-white">
      <span className="text-[#6B39A7] text-base font-semibold">
        {currentStep} DE {totalSteps}
      </span>

      <button
        onClick={onSkip}
        className="text-base font-semibold bg-[#EBD2FF] text-[#6B39A7] px-5 py-2 rounded-[10px] shadow-[0px_8px_20px_0px_rgba(0,0,0,0.12)]"
      >
        Pular
      </button>
    </div>
  );
}