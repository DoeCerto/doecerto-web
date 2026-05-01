import ActionCard from "@/components/ui/HelpCenterActionCard";

export default function HelpCenterPage() {
  return (
    <main>
      <div className="p-[25px] w-full h-[200px] bg-[#6B39A7] text-white px-6 flex flex-col">
        <div className="w-[20px] h-[20px] rounded-[50px] border border-white">x</div>

      </div>
      <div className="p-[25px]">
      <h1 className="text-xl font-bold mb-4">
        Como podemos te ajudar?
      </h1>

      <div className="flex gap-4 flex-row">
        <ActionCard
          icon="💰"
          title="Como doar dinheiro"
          description="Pix e boleto"
        />

        <ActionCard
          icon="📦"
          title={
            <>
              Como doar <br /> dinheiro
            </>
          }
          description="Ração, roupas e mais"
        />
      </div>
      </div>
    </main>
  );
}