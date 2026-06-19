import { Loader2, PackageOpen, Trash2, FileText } from "lucide-react";
import { ListaItem } from "@/components/specific/Donation/donation";

interface ItemsListProps {
  listaEnvio: ListaItem[];
  onRemove: (index: number) => void;
  onSubmit: (ev: React.FormEvent) => void;
  loading: boolean;
  disabled: boolean;
  onCancel?: () => void;
}

export function DonationItemsList({
  listaEnvio,
  onRemove,
  onSubmit,
  loading,
  disabled,
  onCancel,
}: ItemsListProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(107,57,167,0.05)] border border-gray-100 p-6 md:p-8 flex flex-col gap-5 relative overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <h2 className="text-xs md:text-sm font-black text-gray-400 uppercase tracking-widest">
          Itens Agendados para Entrega
        </h2>
        {listaEnvio.length > 0 && (
          <span className="bg-[#6B39A7] text-white font-black text-[10px] md:text-xs px-2.5 py-1 rounded-full">
            {listaEnvio.length} {listaEnvio.length === 1 ? "Item" : "Itens"}
          </span>
        )}
      </div>

      {listaEnvio.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center bg-gray-50/30 px-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
            <PackageOpen size={22} />
          </div>
          <p className="text-sm md:text-base text-gray-800 font-bold">
            Nenhum item na lista
          </p>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-[220px] md:max-w-[280px] font-medium leading-relaxed">
            Adicione as especificações acima para montar o seu lote de doação.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-64 md:max-h-80 overflow-y-auto pr-1">
          {listaEnvio.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-white p-3.5 rounded-2xl border border-gray-100 gap-3"
            >
              <div className="flex gap-3 items-center min-w-0 flex-1">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-purple-50 text-purple-700 font-black text-xs md:text-sm flex items-center justify-center shrink-0">
                  {item.quantidade}x
                </div>
                <div className="min-w-0">
                  <p className="text-sm md:text-base font-black text-gray-800 truncate">
                    {item.itemName}
                  </p>
                  <p className="text-xs md:text-sm text-purple-600 font-bold truncate mt-0.5 flex items-center gap-1">
                    <FileText size={12} className="inline shrink-0 md:w-3.5 md:h-3.5" />
                    {item.detalhes}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={15} className="md:w-4 md:h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 mt-1">
        <button
          type="submit"
          disabled={disabled || loading || listaEnvio.length === 0}
          className="w-full bg-gradient-to-r from-[#6B39A7] to-[#55278d] hover:from-[#55278d] text-white font-black py-4 md:py-4.5 rounded-2xl shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:opacity-40 flex items-center justify-center gap-2 text-base md:text-lg transition-all"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <PackageOpen size={20} className="md:w-5 md:h-5" />
          )}
          {loading ? "Registrando Doação..." : "Finalizar Doação"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full bg-transparent text-gray-400 font-bold text-sm md:text-base py-2 hover:text-gray-600 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}