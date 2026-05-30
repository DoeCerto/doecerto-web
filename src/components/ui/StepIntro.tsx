type StepIntroProps = {
  label: string;
  title: string;
  description: string;
};

export default function StepIntro({
  label,
  title,
  description,
}: StepIntroProps) {
  return (
    <div className="flex flex-col">
      <span className="text-[#6B39A7] font-extrabold text-[24px]">
        {label}
      </span>

      <h1 className="text-[24px] font-medium mb-[7px] leading-tight">
        {title}
      </h1>

      <p className="text-[20px] font-normal">
        {description}
      </p>
    </div>
  );
}