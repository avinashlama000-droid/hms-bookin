type WorkflowStepProps = {
  index: number;
  title: string;
  description: string;
};

export function WorkflowStep({ index, title, description }: WorkflowStepProps) {
  return (
    <li className="relative rounded-lg bg-white px-5 py-4 shadow-sm">
      <div className="absolute -left-[2.45rem] top-4 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white ring-4 ring-white">
        {String(index).padStart(2, "0")}
      </div>
      <h3 className="text-base font-bold text-muted-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-600">{description}</p>
    </li>
  );
}
