"use client";

type ActionCardProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: string;
  onClick?: () => void;
};

export default function ActionCard({
  icon,
  title,
  description,
  onClick,
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="h-full w-full overflow-hidden px-[15px] py-[9px] flex flex-col text-left bg-white rounded-[10px] shadow-[0px_8px_16px_rgba(0,0,0,0.12)] hover:shadow-[0px_10px_20px_rgba(0,0,0,0.15)] transition"
    >
      <div className="text-xl mb-1">{icon}</div>

      <h3 className="font-grotesque font-semibold text-[20px] leading-tight min-h-[56px] max-w-[120px]">
        {title}
      </h3>

      <p className="font-grotesque text-[16px] text-gray-500">
        {description}
      </p>
    </button>
  );
}