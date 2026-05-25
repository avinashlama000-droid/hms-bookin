import type { ReactNode } from "react";

type RoleCardProps = {
  role: string;
  description: string;
  permissions: string[];
  icon: ReactNode;
};

export function RoleCard({ role, description, permissions, icon }: RoleCardProps) {
  return (
    <article className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-muted-900">{role}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-600">{description}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {permissions.map((permission) => (
          <li key={permission} className="flex items-center gap-2 text-sm text-muted-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
            {permission}
          </li>
        ))}
      </ul>
    </article>
  );
}
