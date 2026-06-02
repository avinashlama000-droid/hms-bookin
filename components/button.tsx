import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  href?: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary: "glass-button border text-white hover:brightness-105",
  secondary:
    "border border-white/70 bg-white/85 text-muted-800 hover:border-brand-200 hover:bg-white",
  ghost: "text-muted-700 hover:bg-muted-100",
};

export function Button({
  href,
  children,
  icon,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const classes = `inline-flex h-10 items-center justify-center gap-2 rounded-ui px-4 text-sm font-bold transition-all duration-200 ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {icon}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button type="button" className={classes}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
