import ActionCard from "@/components/ui/HelpCenterActionCard";
import { X } from "lucide-react";
import { FiSearch } from "react-icons/fi";

export default function HelpCenterPage() {
  return (
    <main>
      <div className="p-[25px] w-full bg-[#6B39A7] text-white px-6 flex flex-col">
        
        <div className="flex justify-end">
          <button className="w-[20px] h-[20px] flex items-center justify-center rounded-full bg-white ">
          <X size={16} strokeWidth={3} className="text-[#6B39A7]"/>
          </button>
        </div>

        <h1 className="text-2xl font-semibold mt-3 mb-3">
        Como podemos te ajudar?
        </h1>

         <div className="flex items-center gap-3 bg-white shadow-sm rounded-xl px-3 py-2">
          <FiSearch className="text-gray-400" />
          <input
            // value={query}
            // onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquise uma ONG, cidade ou causa"
            className="w-full outline-none text-base text-gray-400"
          />
        </div>

      </div>

      <div className="p-[25px]">
      <h1 className="text-[20px] font-extrabold mb-4 text-[#6B39A7]">
        DOAÇÕES
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