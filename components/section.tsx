import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  tone?: "page" | "white";
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  tone = "page",
}: SectionProps) {
  return (
    <section id={id} className={tone === "white" ? "bg-white" : "bg-surface-page"}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-normal text-brand-700">
              {eyebrow}
            </p>
          )}
          <h2 className="text-2xl font-bold text-muted-900 sm:text-3xl">{title}</h2>
          {description && (
            <p className="mt-4 text-base leading-7 text-muted-600">{description}</p>
          )}
        </div>
        <div className="mt-9">{children}</div>
      </div>
    </section>
  );
}
