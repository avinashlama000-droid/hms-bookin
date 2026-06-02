import type { ReactNode } from "react";

type ModuleCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function ModuleCard({ title, description, icon }: ModuleCardProps) {
  return (
    <article className="rounded-lg border border-border bg-white p-5 transition-all duration-200 hover:border-brand-200">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        {icon}
      </div>
      <h3 className="text-base font-bold text-muted-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-600">{description}</p>
    </article>
  );
}
