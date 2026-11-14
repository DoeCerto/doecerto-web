import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  items: Array<{ id: number; description: string }>;
  selectedValue: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function CustomDropdown({ items, selectedValue, onSelect, disabled }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (ref.current && !ref.current.contains(ev.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentText = selectedValue === "Outros"
    ? "Outros (Item não listado)"
    : items.find(i => i.id.toString() === selectedValue)?.description || "Selecione um item...";

  return (
    <div className="flex flex-col gap-1.5 relative" ref={ref}>
      <label className="font-bold text-xs sm:text-sm text-slate-600 uppercase tracking-wider ml-1">
        Item da Wishlist da ONG
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 rounded-xl border-2 border-slate-200 text-slate-800 font-semibold text-base focus:border-[#6B39A7] focus:ring-4 focus:ring-purple-100/70 bg-white outline-none flex items-center justify-between text-left disabled:opacity-50 transition-all cursor-pointer shadow-xs"
      >
        <span className={selectedValue ? "text-slate-900 font-bold" : "text-slate-400 font-medium"}>{currentText}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto p-1.5">
          <button type="button" onClick={() => { onSelect(""); setIsOpen(false); }} className="w-full text-left p-2.5 text-xs sm:text-sm text-slate-400 hover:bg-slate-50 rounded-lg font-semibold">
            Limpar seleção...
          </button>
          {items.map((item) => (
            <button key={item.id} type="button" onClick={() => { onSelect(item.id.toString()); setIsOpen(false); }} className={`w-full text-left p-3 text-sm sm:text-base rounded-lg font-bold transition-colors ${selectedValue === item.id.toString() ? "bg-purple-50 text-[#6B39A7]" : "text-slate-700 hover:bg-slate-50"}`}>
              {item.description}
            </button>
          ))}
          <button type="button" onClick={() => { onSelect("Outros"); setIsOpen(false); }} className={`w-full text-left p-3 text-sm sm:text-base rounded-lg font-bold border-t border-slate-100 mt-1 transition-colors ${selectedValue === "Outros" ? "bg-purple-50 text-[#6B39A7]" : "text-slate-600 hover:bg-slate-50"}`}>
            Outros (Item não listado)
          </button>
        </div>
      )}
    </div>
  );
}