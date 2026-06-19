import React from "react";
import { Clock } from "lucide-react";

interface PendingAnalysisModalProps {
  isOpen: boolean;
  title?: string;
  description: string;
  onClose: () => void;
}

export function PendingAnalysisModal({ 
  isOpen, 
  title = "Em análise", 
  description, 
  onClose 
}: PendingAnalysisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-amber-50">
          <Clock size={40} />
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 mb-3">
          {title}
        </h2>
        
        <p className="text-gray-600 leading-relaxed mb-8">
          {description}
        </p>
        
        <button 
          onClick={onClose}
          className="w-full bg-[#6B39A7] hover:bg-[#55278d] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98]"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}