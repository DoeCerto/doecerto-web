"use client";

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export default function InfoCard({ icon, title, description }: InfoCardProps) {
  return (
    <div
      className="w-full p-[20px] flex flex-row gap-2 bg-white rounded-[10px] shadow-[0px_8px_16px_rgba(0,0,0,0.12)] hover:shadow-[0px_10px_20px_rgba(0,0,0,0.15)] transition mb-3"
    >
      <div
        className="p-[8px] rounded-[10px] bg-[#EBD2FF] flex items-center justify-center"
      >
        {icon}
      </div>

      <div className="flex flex-col">
        <h3 className="font-semibold text-[20px] leading-tight">
          {title}
        </h3>

        <p className="text-[16px] text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}