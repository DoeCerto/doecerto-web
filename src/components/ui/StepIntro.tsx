type StepIntroProps = {
  label: string;
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
      <span className={`inline-block w-fit text-[#6B39A7] font-extrabold text-[24px] ${labelClassName}`}>
        {label}
      </span>

      <h1 className="text-[24px] font-medium mb-[7px] leading-tight">
        {title}
      </h1>

      <p className="text-[18px] font-normal">
        {description}
      </p>
    </div>
  );
}