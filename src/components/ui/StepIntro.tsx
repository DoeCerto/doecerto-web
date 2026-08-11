type StepIntroProps = {
  label: React.ReactNode;
  title: string;
  description: string;
  labelClassName?: string;
};

export default function StepIntro({
  label,
  title,
  description,
  labelClassName = "",
}: StepIntroProps) {
  return (
    <div className="flex flex-col">
      <span className={`inline-block w-fit text-[#000000] font-extrabold text-[40px] sm:text-[60px] leading-[50px] mb-[40px] ${labelClassName}`}>
        {label}
      </span>

      <h1 className="text-[24px] text-[#353535] font-medium mb-[15px] leading-tight">
        {title}
      </h1>

      <p className="text-[22px] font-medium text-[#666666] leading-[20px]">
        {description}
      </p>
    </div>
  );
}