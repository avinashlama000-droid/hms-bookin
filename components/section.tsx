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
  const toneClasses =
    tone === "white"
      ? "border-border bg-surface-card"
      : "border-brand-100/80 bg-surface-page";

  return (
    <section id={id} className={`scroll-mt-24 border-b ${toneClasses}`}>
      <div className="container-grid py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-2 text-[0.65rem] font-black uppercase tracking-[0.18em] text-brand-700">
              {eyebrow}
            </p>
          )}
          <h2 className="text-xl font-black leading-tight text-muted-900 sm:text-3xl">{title}</h2>
          {description && (
            <p className="mt-3 text-sm leading-6 text-muted-600">{description}</p>
          )}
        </div>
        <div className="mt-7">{children}</div>
      </div>
    </section>
  );
}
