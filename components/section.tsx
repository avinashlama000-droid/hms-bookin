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
    <section id={id} className={`scroll-mt-24 border-b border-white/70 ${tone === "white" ? "bg-white" : "bg-surface-page"}`}>
      <div className="container-grid py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-brand-700">
              {eyebrow}
            </p>
          )}
          <h2 className="text-2xl font-black leading-tight text-muted-900 sm:text-4xl">{title}</h2>
          {description && (
            <p className="mt-4 text-base leading-7 text-muted-600">{description}</p>
          )}
        </div>
        <div className="mt-9">{children}</div>
      </div>
    </section>
  );
}
