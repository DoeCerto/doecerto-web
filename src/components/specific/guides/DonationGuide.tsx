import StepHeader from "@/components/ui/StepHeader";

export default function DonationGuide() {
  return (
    <main className="p-[25px]">
      <StepHeader 
      currentStep={1}
      totalSteps={5}
      />
    </main>
  );
}