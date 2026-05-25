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
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  secondary:
    "border border-border bg-white text-muted-800 hover:border-border-strong hover:bg-surface-subtle",
  ghost: "text-muted-700 hover:bg-muted-100",
};

export function Button({
  href,
  children,
  icon,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const classes = `inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all duration-200 ${variants[variant]} ${className}`;

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
