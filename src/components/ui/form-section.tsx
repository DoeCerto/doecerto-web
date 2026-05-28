import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FormSectionProps {
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  italicTitle?: boolean;
}

export function FormSection({ title, icon: Icon, children, className = "", italicTitle }: FormSectionProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      className={`p-6 md:p-8 rounded-2xl bg-white shadow-md border border-gray-100 ${className}`}
    >
      {title && (
        <h2 className={`text-lg font-bold text-[#6B39A7] mb-6 flex items-center gap-2 ${italicTitle ? 'italic border-l-4 border-purple-200 pl-4' : ''}`}>
          {Icon && <Icon size={20} className="text-purple-600" />} 
          {title}
        </h2>
      )}
      {children}
    </motion.div>
  );
}
