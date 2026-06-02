import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: "brand" | "success" | "warning";
};

const toneClasses = {
  brand: "bg-brand-50 text-brand-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
};

export function MetricCard({ label, value, detail, icon, tone = "brand" }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/65 p-4 backdrop-blur-sm">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-muted-900">{value}</p>
      <p className="mt-1 text-sm font-semibold text-muted-700">{label}</p>
      <p className="mt-1 text-xs leading-5 text-muted-500">{detail}</p>
    </div>
  );
}
