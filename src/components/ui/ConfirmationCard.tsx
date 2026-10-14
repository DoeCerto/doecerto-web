import React from "react";
import {
  DollarSign,
  PackageCheck,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";

interface ConfirmationCardProps {
  type: "money" | "material";
  title?: string;
  description?: string;
  amountOrQuantity: string;
  detailsLabel?: string;
  detailsContent?: React.ReactNode;
  detailsText?: string;
  primaryButtonText?: string;
  onPrimaryAction: () => void;
  secondaryButtonText?: string;
  onSecondaryAction?: () => void;
}

export function ConfirmationCard({
  type,
  title,
  description,
  amountOrQuantity,
  detailsLabel,
  detailsText,
  detailsContent,
  primaryButtonText = "Entendido",
  onPrimaryAction,
  secondaryButtonText,
  onSecondaryAction,
}: ConfirmationCardProps) {
  const isMoney = type === "money";

  const theme = {
    bgLight: isMoney
      ? "from-emerald-50 to-teal-50"
      : "from-purple-50 to-indigo-50",
    border: isMoney ? "border-emerald-100/80" : "border-purple-100/80",
    textPrimary: isMoney ? "text-emerald-700" : "text-[#6B39A7]",
    iconBg: isMoney ? "bg-emerald-500" : "bg-[#6B39A7]",
    buttonGradient: isMoney
      ? "from-emerald-600 to-teal-600 hover:from-emerald-700"
      : "from-[#6B39A7] to-[#55278d] hover:from-[#55278d]",
  };

  return (
    <div className="w-full max-w-md md:max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
      <div className="relative mb-5">
        <div
          className={`w-14 h-14 rounded-xl ${isMoney ? "bg-emerald-50 text-emerald-600 border border-emerald-200/80" : "bg-purple-50 text-[#6B39A7] border border-purple-200/80"} flex items-center justify-center shadow-xs`}
        >
          {isMoney ? (
            <DollarSign size={28} />
          ) : (
            <PackageCheck size={28} />
          )}
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
        {title || (isMoney ? "Revise os dados da doação" : "Revisar dados do envio")}
      </h2>
      <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mb-6 leading-relaxed">
        {description ||
          (isMoney
            ? "Confira as informações antes de confirmar sua doação via Pix."
            : "Confira os itens selecionados. Após confirmar, a instituição entrará em contato para alinhar os detalhes da entrega.")}
      </p>

      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col gap-3.5 text-left mb-6">
        <div>
          <span className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider block mb-1">
            {isMoney ? "Valor da Doação" : "Total de Itens"}
          </span>
          <span className={`text-2xl sm:text-3xl font-black ${isMoney ? "text-emerald-700" : "text-[#6B39A7]"} font-mono`}>
            {amountOrQuantity}
          </span>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <span className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
            {detailsLabel || (isMoney ? "Identificador Pix" : "Resumo do Lote")}
          </span>
          <div className="text-sm sm:text-base text-slate-800 font-semibold bg-white px-3.5 py-2.5 rounded-lg border border-slate-200 break-all leading-relaxed">
            {detailsContent ?? detailsText}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onPrimaryAction}
          className={`w-full ${isMoney ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#6B39A7] hover:bg-[#582d8c]"} text-white font-bold py-4 rounded-xl shadow-sm flex items-center justify-center gap-2 text-base transition-all active:scale-[0.98] cursor-pointer`}
        >
          <span>{primaryButtonText}</span>
          <ArrowRight size={18} />
        </button>

        {secondaryButtonText && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="w-full bg-transparent text-slate-400 font-semibold text-sm py-2 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {secondaryButtonText}
          </button>
        )}
      </div>
    </div>
  );
}