"use client";

import { CalendarDays, Clock3, Utensils, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { PublicMealMenu, PublicMealMenuContent } from "@/lib/booking";
import { Section } from "@/components/section";

type MealMenuSectionProps = {
  menus: PublicMealMenu[];
};

type MealKey = "breakfast" | "lunch" | "snacks" | "dinner";
type WeekDayKey = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
type MealMenuEntry = {
  time?: string | null;
  key?: string | null;
  value?: string | null;
};
type FlexibleWeeklyMealMenu = Record<WeekDayKey, MealMenuEntry[]>;

const mealItems = [
  ["breakfast", "Breakfast"],
  ["lunch", "Lunch"],
  ["snacks", "Snacks"],
  ["dinner", "Dinner"],
] as const satisfies ReadonlyArray<readonly [MealKey, string]>;

const weekDays = [
  { key: "sunday", label: "Sunday" },
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
] as const satisfies ReadonlyArray<{ key: WeekDayKey; label: string }>;

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
        <div className="grid gap-3 lg:grid-cols-3">
          {publishedMenus.map((menu) => (
            <article key={`${menu.tenant_slug}-${menu.block_id}`} className="premium-card rounded-ui p-4 transition duration-200 hover:-translate-y-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.7rem] font-black uppercase tracking-[0.14em] text-brand-700">{menu.tenant_name}</p>
                  <h3 className="mt-1 truncate text-lg font-black text-muted-900">
                    {menu.block_name || "Hostel block"}
                  </h3>
                  {menu.location ? (
                    <p className="mt-1 line-clamp-1 text-sm text-muted-500">{menu.location}</p>
                  ) : null}
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ui bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  <Utensils className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-4 grid gap-2">
                {mealItems.map(([key, label]) => (
                  <MealPreview
                    key={key}
                    label={label}
                    value={menu.menu?.[key] || "Not published"}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-2.5">
                <PublishedAt menu={menu.menu} />
                <button
                  type="button"
                  onClick={() => setSelectedMenu(menu)}
                  className="h-9 rounded-ui border border-border bg-white px-3 text-sm font-black text-muted-800 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                >
                  View menu
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-ui px-4 py-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-700">
            <Utensils className="h-7 w-7" />
          </span>
          <p className="mt-3 text-base font-black text-muted-900">No meal menus published yet.</p>
          <p className="mt-1.5 text-sm leading-6 text-muted-600">
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
    <div className="rounded-ui bg-surface-subtle px-2.5 py-1.5 ring-1 ring-border/60">
      <p className="text-[0.7rem] font-black uppercase tracking-[0.12em] text-muted-500">{label}</p>
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
  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-muted-900/50 px-4 py-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="max-h-[92svh] w-full max-w-5xl overflow-hidden rounded-ui border border-white/70 bg-white">
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
            <div className="mt-3">
              <PublicMealMenuTable menu={menu.menu} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicMealMenuTable({ menu }: { menu: PublicMealMenuContent | null }) {
  const weeklyMenu = normalizeWeeklyMenu(menu?.weekly_menu ?? null);
  const routineTable = buildRoutineTable(menu, weeklyMenu);

  if (routineTable.rows.length === 0) {
    return (
      <p className="rounded-lg bg-surface-subtle px-3 py-3 text-sm leading-6 text-muted-600">
        Weekly meal details are not published yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-ui border border-border bg-white">
      <table className="min-w-[640px] w-full border-collapse text-left">
        <thead>
          <tr className="bg-surface-subtle">
            <th className="sticky left-0 z-20 w-32 border-b border-r border-border bg-surface-subtle px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-muted-500">
              Day
            </th>
            {routineTable.columns.map((column) => (
              <th
                key={column.id}
                className="min-w-44 border-b border-border px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-muted-500"
              >
                <span className={column.timeLabel ? "inline-flex items-center gap-1.5" : undefined}>
                  <span>{column.label}</span>
                  {column.timeLabel ? <span>{column.timeLabel}</span> : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {routineTable.rows.map((row, index) => {
            const previousRow = routineTable.rows[index - 1];
            const showDay = !previousRow || previousRow.dayLabel !== row.dayLabel;

            return (
              <tr key={row.id} className="align-top">
                <th className="sticky left-0 z-10 border-r border-border/70 bg-surface-subtle px-4 py-4 text-sm font-black text-muted-900">
                  {showDay ? row.dayLabel : ""}
                </th>
                {routineTable.columns.map((column) => {
                  const value = displayCellValues(row.cells[column.id] ?? []);

                  return (
                    <td key={column.id} className="px-4 py-4 text-sm font-semibold leading-6 text-muted-700">
                      {value ? <span className="whitespace-pre-wrap">{value}</span> : <span className="text-muted-400">-</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function cleanText(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function createEmptyWeeklyMenu(): FlexibleWeeklyMealMenu {
  return weekDays.reduce((days, day) => {
    days[day.key] = [];

    return days;
  }, {} as FlexibleWeeklyMealMenu);
}

function normalizeWeeklyMenu(menu?: unknown): FlexibleWeeklyMealMenu {
  const empty = createEmptyWeeklyMenu();

  if (!menu || typeof menu !== "object" || Array.isArray(menu)) return empty;

  const weeklyMenu = menu as Partial<Record<WeekDayKey, unknown>>;

  weekDays.forEach((day) => {
    const dayMenu = weeklyMenu[day.key];

    if (Array.isArray(dayMenu)) {
      empty[day.key] = dayMenu
        .filter(isMealMenuEntry)
        .map((entry) => ({
          time: cleanText(entry.time),
          key: cleanText(entry.key),
          value: cleanText(entry.value),
        }));
      return;
    }

    if (dayMenu && typeof dayMenu === "object") {
      const legacyDayMenu = dayMenu as Partial<Record<MealKey, unknown>>;
      empty[day.key] = mealItems
        .map(([mealKey, label]) => ({
          key: label,
          value: cleanText(legacyDayMenu[mealKey]),
          time: null,
        }))
        .filter((entry) => Boolean(entry.value));
    }
  });

  return empty;
}

function isMealMenuEntry(value: unknown): value is MealMenuEntry {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function entryHasContent(entry: MealMenuEntry): boolean {
  return Boolean(cleanText(entry.key) || cleanText(entry.value) || cleanText(entry.time));
}

function columnIdForKey(key: string): string {
  return key.trim().toLowerCase();
}

function displayCellValues(values: string[]): string | null {
  const filled = values.map((value) => value.trim()).filter(Boolean);

  return filled.length > 0 ? filled.join("\n") : null;
}

function parseTimeToMinutes(value: string | null): number | null {
  if (!value) return null;

  const normalized = value.trim().toUpperCase();
  const twelveHourMatch = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3];

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    if (period === "AM" && hours === 12) hours = 0;
    if (period === "PM" && hours !== 12) hours += 12;

    return hours * 60 + minutes;
  }

  const twentyFourHourMatch = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!twentyFourHourMatch) return null;

  const hours = Number(twentyFourHourMatch[1]);
  const minutes = Number(twentyFourHourMatch[2]);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours > 23 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatTimeLabel(value: string | null): string | null {
  const minutesFromMidnight = parseTimeToMinutes(value);
  if (minutesFromMidnight === null) return value;

  const hours24 = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  const period = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 || 12;

  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

type RoutineColumn = {
  id: string;
  label: string;
  timeLabel?: string | null;
  timeSortValue?: number | null;
};

type RoutineRow = {
  id: string;
  dayLabel: string;
  cells: Record<string, string[]>;
};

function buildRoutineTable(
  menu: PublicMealMenuContent | null,
  weeklyMenu: FlexibleWeeklyMealMenu,
): {
  columns: RoutineColumn[];
  rows: RoutineRow[];
} {
  const columns: RoutineColumn[] = [];
  const columnIds = new Set<string>();
  const rows: RoutineRow[] = [];

  const ensureColumn = (
    idSource: string,
    label: string,
    timeLabel?: string | null,
    timeSortValue?: number | null,
  ): string => {
    const id = columnIdForKey(idSource);

    if (!columnIds.has(id)) {
      columnIds.add(id);
      columns.push({ id, label, timeLabel, timeSortValue });
    }

    return id;
  };

  weekDays.forEach((day) => {
    const row: RoutineRow = {
      id: `${day.key}-published`,
      dayLabel: day.label,
      cells: {},
    };

    weeklyMenu[day.key].filter(entryHasContent).forEach((entry) => {
      const keyLabel = cleanText(entry.key) ?? "Menu";
      const rawTimeLabel = cleanText(entry.time);
      const formattedTimeLabel = formatTimeLabel(rawTimeLabel);
      const timeLabel = formattedTimeLabel ?? "Not set";
      const timeSortValue = parseTimeToMinutes(rawTimeLabel);
      const columnId = ensureColumn(
        timeLabel !== "Not set" ? `${keyLabel}-${timeLabel}` : keyLabel,
        keyLabel,
        timeLabel !== "Not set" ? timeLabel : null,
        timeSortValue,
      );

      row.cells[columnId] = [...(row.cells[columnId] ?? []), cleanText(entry.value) ?? ""];
    });

    if (Object.keys(row.cells).length > 0) {
      rows.push(row);
    }
  });

  if (rows.length === 0 && menu) {
    const legacyCells: Record<string, string[]> = {};

    mealItems.forEach(([key, label]) => {
      const value = cleanText(menu[key]);
      if (!value) return;

      const columnId = ensureColumn(label, label);
      legacyCells[columnId] = [value];
    });

    if (Object.keys(legacyCells).length > 0) {
      rows.push({
        id: "legacy-menu",
        dayLabel: "All days",
        cells: legacyCells,
      });
    }
  }

  columns.sort((left, right) => {
    const leftTime = left.timeSortValue ?? Number.MAX_SAFE_INTEGER;
    const rightTime = right.timeSortValue ?? Number.MAX_SAFE_INTEGER;

    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    return left.label.localeCompare(right.label);
  });

  return { columns, rows };
}
