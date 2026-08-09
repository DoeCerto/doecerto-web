import { PhoneOff } from "lucide-react";

export function MissingPhoneAlert({ visible, onGoToProfile }: { visible: boolean; onGoToProfile: () => void }) {
  if (!visible) return null;
  return (
    <div className="mb-6 p-4 bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-3xl flex items-start gap-3.5 shadow-sm">
      <div className="bg-red-500/10 p-2 rounded-xl text-red-600 shrink-0">
        <PhoneOff size={18} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-black text-red-900">Ação necessária</p>
        <p className="text-xs text-red-700/90 leading-relaxed font-medium">
          A ONG precisa do seu número de telefone celular para alinhar os detalhes da entrega.
        </p>
        <button type="button" onClick={onGoToProfile} className="text-xs font-black text-[#6B39A7] bg-white border border-purple-100 shadow-sm px-3 py-1.5 rounded-xl w-fit mt-1.5 hover:bg-purple-50 transition-colors">
          Completar meu perfil agora
        </button>
      </div>
    </div>
  );
}