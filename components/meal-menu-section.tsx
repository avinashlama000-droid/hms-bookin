"use client";

import { CalendarDays, Clock3, Utensils, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { PublicMealMenu, PublicMealMenuContent } from "@/lib/booking";
import { Section } from "@/components/section";

type MealMenuSectionProps = {
  menus: PublicMealMenu[];
};

const mealItems = [
  ["breakfast", "Breakfast"],
  ["lunch", "Lunch"],
  ["snacks", "Snacks"],
  ["dinner", "Dinner"],
] as const;

export function MealMenuSection({ menus }: MealMenuSectionProps) {
  const publishedMenus = useMemo(
    () => menus.filter((menu) => Boolean(menu.menu)),
    [menus],
  );
  const [selectedMenu, setSelectedMenu] = useState<PublicMealMenu | null>(null);

  return (
    <Section
      id="meals"
      eyebrow="Meal menu"
      title="Know the food plan before you visit."
      description="Published menus help students and guardians understand the daily meal routine for each hostel block."
    >
      {publishedMenus.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {publishedMenus.map((menu) => (
            <article key={`${menu.tenant_slug}-${menu.block_id}`} className="premium-card rounded-ui p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-700">{menu.tenant_name}</p>
                  <h3 className="mt-1 truncate text-xl font-black text-muted-900">
                    {menu.block_name || "Hostel block"}
                  </h3>
                  {menu.location ? (
                    <p className="mt-1 line-clamp-1 text-sm text-muted-500">{menu.location}</p>
                  ) : null}
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-ui bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  <Utensils className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-5 grid gap-2">
                {mealItems.map(([key, label]) => (
                  <MealPreview
                    key={key}
                    label={label}
                    value={menu.menu?.[key] || "Not published"}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <PublishedAt menu={menu.menu} />
                <button
                  type="button"
                  onClick={() => setSelectedMenu(menu)}
                  className="h-10 rounded-ui border border-border bg-white px-3 text-sm font-black text-muted-800 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                >
                  View menu
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-ui px-5 py-12 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-700 shadow-lift">
            <Utensils className="h-8 w-8" />
          </span>
          <p className="mt-4 text-lg font-black text-muted-900">No meal menus published yet.</p>
          <p className="mt-2 text-sm leading-6 text-muted-600">
            Published hostel meal menus from HMS will appear here for students.
          </p>
        </div>
      )}

      {selectedMenu ? (
        <MealMenuDialog menu={selectedMenu} onClose={() => setSelectedMenu(null)} />
      ) : null}
    </Section>
  );
}

function MealPreview({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-ui bg-surface-subtle px-3 py-2 ring-1 ring-border/60">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-500">{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-muted-800">{value}</p>
    </div>
  );
}

function PublishedAt({ menu }: { menu: PublicMealMenuContent | null }) {
  if (!menu?.published_at) {
    return (
      <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-500">
        <Clock3 className="h-4 w-4" />
        Published
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-500">
      <CalendarDays className="h-4 w-4" />
      {new Date(menu.published_at).toLocaleDateString()}
    </span>
  );
}

function MealMenuDialog({
  menu,
  onClose,
}: {
  menu: PublicMealMenu;
  onClose: () => void;
}) {
  const weeklyItems = getWeeklyMenuItems(menu.menu?.weekly_menu);

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-muted-900/50 px-4 py-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="max-h-[92svh] w-full max-w-2xl overflow-hidden rounded-ui border border-white/70 bg-white shadow-deep">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">Meal menu</p>
            <h3 className="mt-1 truncate text-2xl font-black text-muted-900">
              {menu.block_name || "Hostel block"}
            </h3>
            <p className="mt-1 text-sm text-muted-600">{menu.tenant_name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ui border border-border text-muted-600 transition hover:bg-muted-100"
            aria-label="Close meal menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(92svh-5.5rem)] overflow-y-auto px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {mealItems.map(([key, label]) => (
              <MealPreview
                key={key}
                label={label}
                value={menu.menu?.[key] || "Not published"}
              />
            ))}
          </div>

          <div className="mt-6">
            <p className="text-sm font-bold text-muted-900">Weekly details</p>
            {weeklyItems.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {weeklyItems.map(([day, value]) => (
                  <div key={day} className="rounded-lg border border-border px-3 py-2">
                    <p className="text-xs font-bold uppercase text-brand-700">{day}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-700">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 rounded-lg bg-surface-subtle px-3 py-3 text-sm leading-6 text-muted-600">
                Weekly meal details are not published yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getWeeklyMenuItems(value: unknown): [string, string][] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.entries(value as Record<string, unknown>)
    .map(([day, details]) => [formatDay(day), formatWeeklyValue(details)] as [string, string])
    .filter(([, details]) => Boolean(details.trim()));
}

function formatDay(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatWeeklyValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${formatDay(key)}: ${String(item ?? "")}`)
      .filter((item) => !item.endsWith(": "))
      .join(" | ");
  }

  return "";
}
