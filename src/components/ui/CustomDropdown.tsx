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
      <label className="font-extrabold text-xs text-gray-500 uppercase ml-1">O que você vai doar?</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 rounded-2xl border-2 border-gray-100 text-gray-700 font-bold text-sm focus:border-[#6B39A7] bg-gray-50/70 outline-none flex items-center justify-between text-left disabled:opacity-50"
      >
        <span className={selectedValue ? "text-gray-800" : "text-gray-400"}>{currentText}</span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-50 max-h-52 overflow-y-auto p-1.5">
          <button type="button" onClick={() => { onSelect(""); setIsOpen(false); }} className="w-full text-left p-2.5 text-xs text-gray-400 hover:bg-gray-50 rounded-xl font-semibold">
            Limpar seleção...
          </button>
          {items.map((item) => (
            <button key={item.id} type="button" onClick={() => { onSelect(item.id.toString()); setIsOpen(false); }} className={`w-full text-left p-3 text-sm rounded-xl font-bold ${selectedValue === item.id.toString() ? "bg-purple-50 text-[#6B39A7]" : "text-gray-700 hover:bg-gray-50"}`}>
              {item.description}
            </button>
          ))}
          <button type="button" onClick={() => { onSelect("Outros"); setIsOpen(false); }} className={`w-full text-left p-3 text-sm rounded-xl font-bold border-t border-gray-50 mt-1 ${selectedValue === "Outros" ? "bg-purple-50 text-[#6B39A7]" : "text-gray-500 hover:bg-gray-50"}`}>
            Outros (Item não listado)
          </button>
        </div>
      )}
    </div>
  );
}