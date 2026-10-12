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
    <div className="w-full max-w-md md:max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(107,57,167,0.06)] border border-gray-100 p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden">
      <div className="relative mb-6">
        <div
          className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl ${theme.iconBg} text-white flex items-center justify-center shadow-lg transform rotate-6 hover:rotate-0 transition-transform duration-300`}
        >
          {isMoney ? (
            <DollarSign size={32} className="md:w-9 md:h-9" />
          ) : (
            <PackageCheck size={32} className="md:w-9 md:h-9" />
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
          <ClipboardCheck
            size={22}
            className={isMoney ? "text-emerald-500" : "text-[#6B39A7]"}
          />
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
        {title || (isMoney ? "Revise os dados da doação!" : "Doação Agendada!")}
      </h2>
      <p className="text-base sm:text-lg text-slate-600 font-medium max-w-md mb-8 leading-relaxed">
        {description ||
          (isMoney
            ? "Confira as informações abaixo antes de confirmar sua doação. Após a confirmação, o comprovante será enviado para análise da ONG."
            : "Falta pouco! Revise os dados abaixo para confirmar o envio da sua doação. Após a confirmação, a ONG entrará em contato com você.")}
      </p>

      <div
        className={`w-full bg-gradient-to-br ${theme.bgLight} border ${theme.border} rounded-2xl p-5 md:p-6 flex flex-col gap-4 text-left mb-8`}
      >
        <div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">
            {isMoney ? "Valor da Doação" : "Total de Itens"}
          </span>
          <span
            className={`text-2xl sm:text-3xl font-black ${theme.textPrimary}`}
          >
            {amountOrQuantity}
          </span>
        </div>

        <div className="border-t border-gray-100/60 pt-3">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">
            {detailsLabel || (isMoney ? "Identificador Pix" : "Resumo do Lote")}
          </span>
          <div className="text-sm sm:text-base text-slate-800 font-bold bg-white/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/60 break-all leading-relaxed">
            {detailsContent ?? detailsText}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        <button
          type="button"
          onClick={onPrimaryAction}
          className={`w-full bg-gradient-to-r ${theme.buttonGradient} text-white font-black py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 text-base md:text-lg transition-all transform active:scale-[0.98]`}
        >
          {primaryButtonText}
          <ArrowRight size={20} />
        </button>

        {secondaryButtonText && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="w-full bg-transparent text-slate-400 font-bold text-base py-2.5 hover:text-slate-600 transition-colors"
          >
            {secondaryButtonText}
          </button>
        )}
      </div>
    </div>
  );
}