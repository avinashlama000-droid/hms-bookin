"use client";

import {
  BedDouble,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Minus,
  Navigation,
  Plus,
  Search,
  Utensils,
  X,
  MapPin,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  type AvailableRoom,
} from "@/lib/booking";
import {
  type BookingGuestCounts,
  type BookingSearchIntent,
  type FlexibleStay,
  useBookingSearch,
} from "./booking-search-context";

const categoryTabs = [
  { label: "Rooms", href: "#available-rooms", icon: BedDouble },
  { label: "Meals", href: "#meals", icon: Utensils },
  { label: "Location", href: "#location", icon: MapPin },
];

const flexibleStays: FlexibleStay[] = ["Weekend", "Week", "Month"];

type SearchPanel = "where" | "when" | "who" | null;
type DateTab = "dates" | "flexible";

type DestinationSuggestion = {
  id: string;
  label: string;
  subtitle: string;
  search: string;
  tenantSlug: string;
  kind: "nearby" | "hostel" | "block" | "location";
};

export function SiteHeader({ rooms }: { rooms: AvailableRoom[] }) {
  const bookingSearch = useBookingSearch();
  const [draft, setDraft] = useState<BookingSearchIntent>(() => bookingSearch?.intent ?? emptyIntent());
  const [activePanel, setActivePanel] = useState<SearchPanel>(null);
  const [dateTab, setDateTab] = useState<DateTab>("dates");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(new Date()));

  useEffect(() => {
    setDraft(bookingSearch?.intent ?? emptyIntent());
  }, [bookingSearch?.intent]);

  useEffect(() => {
    if (!activePanel && !mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePanel(null);
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activePanel, mobileOpen]);

  const suggestions = useMemo(() => destinationSuggestions(rooms), [rooms]);
  const filteredSuggestions = useMemo(() => {
    const query = draft.destinationSearch.trim().toLowerCase();
    if (!query) return suggestions.slice(0, 8);

    return suggestions
      .filter((suggestion) => [suggestion.label, suggestion.subtitle, suggestion.search]
        .join(" ")
        .toLowerCase()
        .includes(query))
      .slice(0, 8);
  }, [draft.destinationSearch, suggestions]);

  const monthCards = useMemo(() => upcomingMonths(visibleMonth, 6), [visibleMonth]);
  const guestLabel = formatGuests(draft.guests);
  const whenLabel = formatWhen(draft);

  function chooseDestination(suggestion: DestinationSuggestion) {
    setDraft((current) => ({
      ...current,
      destinationLabel: suggestion.label,
      destinationSearch: suggestion.search,
      tenantSlug: suggestion.tenantSlug,
    }));
    setActivePanel("when");
  }

  function applySearch() {
    const nextIntent = normalizeIntent(draft);
    bookingSearch?.applyIntent(nextIntent);
    setActivePanel(null);
    setMobileOpen(false);
    window.requestAnimationFrame(() => {
      document.getElementById("available-rooms")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function clearSearch() {
    const nextIntent = emptyIntent();
    setDraft(nextIntent);
    bookingSearch?.applyIntent(nextIntent);
    setActivePanel(null);
    setMobileOpen(false);
  }

  return (
    <header className="site-header-fixed border-b border-brand-100 bg-white/95 backdrop-blur-xl">
      {(activePanel || mobileOpen) ? (
        <button
          type="button"
          className="fixed inset-0 top-[7.75rem] z-[-1] bg-muted-900/28 backdrop-blur-[1px]"
          aria-label="Close search panel"
          onClick={() => {
            setActivePanel(null);
            setMobileOpen(false);
          }}
        />
      ) : null}

      <div className="container-grid grid min-h-[7.75rem] grid-rows-[3.5rem_4.25rem] items-center gap-0">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white">
              <BedDouble className="h-5 w-5" />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-base font-black tracking-tight text-brand-800">
                HMS Hostel Booking
              </span>
              <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-muted-500">
                Rooms, meals, and location
              </span>
            </span>
          </a>

          <nav className="hidden items-end justify-center gap-8 md:flex" aria-label="Booking categories">
            {categoryTabs.map(({ label, href, icon: Icon }, index) => (
              <a
                key={href}
                href={href}
                className={`group relative flex items-center gap-2 pb-3 text-sm font-black transition ${
                  index === 0 ? "text-muted-900" : "text-muted-500 hover:text-muted-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
                {index === 0 ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-muted-900" />
                ) : null}
              </a>
            ))}
          </nav>

          <div className="flex justify-end">
            <a
              href="#available-rooms"
              className="hidden rounded-full px-4 py-2 text-sm font-black text-muted-800 transition hover:bg-muted-100 lg:inline-flex"
            >
              Book room
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-11 min-w-0 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-black text-muted-900 shadow-sm md:hidden"
            >
              <Search className="h-4 w-4" />
              <span className="max-w-[11rem] truncate">
                {draft.destinationLabel || "Start your search"}
              </span>
            </button>
          </div>
        </div>

        <div className="relative hidden justify-center md:flex">
          <div className="grid w-[min(100%,66rem)] grid-cols-[1.2fr_1fr_1fr_auto] rounded-full border border-border bg-muted-100 shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
            <SearchSegment
              active={activePanel === "where"}
              label="Where"
              value={draft.destinationLabel || "Search destinations"}
              onClick={() => setActivePanel(activePanel === "where" ? null : "where")}
            />
            <SearchSegment
              active={activePanel === "when"}
              label="When"
              value={whenLabel || "Add dates"}
              onClick={() => setActivePanel(activePanel === "when" ? null : "when")}
            />
            <SearchSegment
              active={activePanel === "who"}
              label="Who"
              value={guestLabel || "Add guests"}
              onClick={() => setActivePanel(activePanel === "who" ? null : "who")}
            />
            <div className="flex items-center gap-2 py-2 pl-1 pr-2">
              {hasSearchIntent(draft) ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="grid h-10 w-10 place-items-center rounded-full text-muted-500 transition hover:bg-white hover:text-muted-900"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={applySearch}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-base font-black text-white transition hover:bg-blue-700"
              >
                <Search className="h-5 w-5" />
                Search
              </button>
            </div>
          </div>

          {activePanel === "where" ? (
            <WherePopover
              value={draft.destinationSearch}
              suggestions={filteredSuggestions}
              onChange={(value) => setDraft((current) => ({
                ...current,
                destinationLabel: value,
                destinationSearch: value,
                tenantSlug: "",
              }))}
              onChoose={chooseDestination}
            />
          ) : null}
          {activePanel === "when" ? (
            <WhenPopover
              draft={draft}
              dateTab={dateTab}
              visibleMonth={visibleMonth}
              monthCards={monthCards}
              onDateTabChange={setDateTab}
              onVisibleMonthChange={setVisibleMonth}
              onDraftChange={setDraft}
            />
          ) : null}
          {activePanel === "who" ? (
            <WhoPopover guests={draft.guests} onGuestsChange={(guests) => setDraft((current) => ({ ...current, guests }))} />
          ) : null}
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-x-0 top-0 z-[80] max-h-[100svh] overflow-y-auto bg-white px-4 pb-6 pt-4 shadow-2xl md:hidden">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base font-black text-muted-900">Search rooms</p>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-700"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            <MobilePanel title="Where" value={draft.destinationLabel || "Search destinations"}>
              <WherePicker
                value={draft.destinationSearch}
                suggestions={filteredSuggestions}
                onChange={(value) => setDraft((current) => ({
                  ...current,
                  destinationLabel: value,
                  destinationSearch: value,
                  tenantSlug: "",
                }))}
                onChoose={chooseDestination}
              />
            </MobilePanel>
            <MobilePanel title="When" value={whenLabel || "Add dates"}>
              <WhenPicker
                draft={draft}
                dateTab={dateTab}
                visibleMonth={visibleMonth}
                monthCards={monthCards}
                onDateTabChange={setDateTab}
                onVisibleMonthChange={setVisibleMonth}
                onDraftChange={setDraft}
              />
            </MobilePanel>
            <MobilePanel title="Who" value={guestLabel || "Add guests"}>
              <GuestCounters guests={draft.guests} onGuestsChange={(guests) => setDraft((current) => ({ ...current, guests }))} />
            </MobilePanel>
          </div>
          <div className="sticky bottom-0 -mx-4 mt-5 flex items-center justify-between border-t border-border bg-white px-4 pt-4">
            <button type="button" onClick={clearSearch} className="text-sm font-black text-muted-700 underline">
              Clear all
            </button>
            <button
              type="button"
              onClick={applySearch}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-black text-white"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function SearchSegment({
  active,
  label,
  value,
  onClick,
}: {
  active: boolean;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 rounded-full px-8 py-3 text-left transition ${
        active ? "bg-white shadow-[0_10px_28px_rgba(15,23,42,0.16)]" : "hover:bg-white/70"
      }`}
    >
      <span className="block text-xs font-black text-muted-900">{label}</span>
      <span className={`mt-0.5 block truncate text-sm font-semibold ${value.startsWith("Add") || value.startsWith("Search") ? "text-muted-500" : "text-muted-800"}`}>
        {value}
      </span>
    </button>
  );
}

function WherePopover(props: {
  value: string;
  suggestions: DestinationSuggestion[];
  onChange: (value: string) => void;
  onChoose: (suggestion: DestinationSuggestion) => void;
}) {
  return (
    <div className="absolute left-0 top-[4.9rem] z-50 w-[34rem] rounded-[2rem] bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.22)]">
      <WherePicker {...props} />
    </div>
  );
}

function WherePicker({
  value,
  suggestions,
  onChange,
  onChoose,
}: {
  value: string;
  suggestions: DestinationSuggestion[];
  onChange: (value: string) => void;
  onChoose: (suggestion: DestinationSuggestion) => void;
}) {
  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search destinations</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-400" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search destinations"
          className="h-12 w-full rounded-full border border-border bg-muted-50 pl-11 pr-4 text-sm font-bold text-muted-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </label>
      <p className="mt-5 text-sm font-black text-muted-900">Suggested destinations</p>
      <div className="mt-3 max-h-[24rem] space-y-1 overflow-y-auto pr-1">
        {suggestions.map((suggestion) => (
          <button
            type="button"
            key={suggestion.id}
            onClick={() => onChoose(suggestion)}
            className="flex w-full items-center gap-4 rounded-2xl p-3 text-left transition hover:bg-muted-50"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              {suggestion.kind === "nearby" ? <Navigation className="h-6 w-6" /> : <MapPin className="h-6 w-6" />}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-black text-muted-900">{suggestion.label}</span>
              <span className="mt-0.5 block truncate text-sm font-semibold text-muted-500">{suggestion.subtitle}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function WhenPopover(props: WhenPickerProps) {
  return (
    <div className="absolute left-1/2 top-[4.9rem] z-50 w-[min(66rem,calc(100vw-5rem))] -translate-x-1/2 rounded-[2rem] bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.22)]">
      <WhenPicker {...props} />
    </div>
  );
}

type WhenPickerProps = {
  draft: BookingSearchIntent;
  dateTab: DateTab;
  visibleMonth: Date;
  monthCards: Date[];
  onDateTabChange: (tab: DateTab) => void;
  onVisibleMonthChange: (date: Date) => void;
  onDraftChange: (updater: (current: BookingSearchIntent) => BookingSearchIntent) => void;
};

function WhenPicker({
  draft,
  dateTab,
  visibleMonth,
  monthCards,
  onDateTabChange,
  onVisibleMonthChange,
  onDraftChange,
}: WhenPickerProps) {
  const secondMonth = addMonths(visibleMonth, 1);

  return (
    <div>
      <div className="mx-auto grid w-full max-w-sm grid-cols-2 rounded-full bg-muted-100 p-1">
        <button
          type="button"
          onClick={() => onDateTabChange("dates")}
          className={`h-11 rounded-full text-sm font-black transition ${dateTab === "dates" ? "bg-white shadow-sm" : "text-muted-600"}`}
        >
          Dates
        </button>
        <button
          type="button"
          onClick={() => onDateTabChange("flexible")}
          className={`h-11 rounded-full text-sm font-black transition ${dateTab === "flexible" ? "bg-white shadow-sm" : "text-muted-600"}`}
        >
          Flexible
        </button>
      </div>

      {dateTab === "dates" ? (
        <div className="mt-7">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onVisibleMonthChange(addMonths(visibleMonth, -1))}
              className="grid h-10 w-10 place-items-center rounded-full text-muted-500 transition hover:bg-muted-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onVisibleMonthChange(addMonths(visibleMonth, 1))}
              className="grid h-10 w-10 place-items-center rounded-full text-muted-700 transition hover:bg-muted-100"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <CalendarMonth
              month={visibleMonth}
              selectedStart={draft.checkInDate}
              selectedEnd={draft.checkOutDate}
              onSelect={(date) => selectDate(date, onDraftChange)}
            />
            <div className="hidden lg:block">
              <CalendarMonth
                month={secondMonth}
                selectedStart={draft.checkInDate}
                selectedEnd={draft.checkOutDate}
                onSelect={(date) => selectDate(date, onDraftChange)}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <h3 className="text-xl font-black text-muted-900">How long would you like to stay?</h3>
          <div className="mt-5 flex justify-center gap-3">
            {flexibleStays.map((stay) => (
              <button
                key={stay}
                type="button"
                onClick={() => onDraftChange((current) => ({ ...current, dateMode: "flexible", flexibleStay: stay }))}
                className={`h-11 rounded-full border px-6 text-sm font-black transition ${
                  draft.flexibleStay === stay ? "border-muted-900 bg-muted-900 text-white" : "border-border text-muted-800 hover:border-muted-900"
                }`}
              >
                {stay}
              </button>
            ))}
          </div>
          <h3 className="mt-10 text-xl font-black text-muted-900">Go anytime</h3>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {monthCards.map((month) => {
              const value = monthKey(month);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onDraftChange((current) => ({ ...current, dateMode: "flexible", flexibleMonth: value }))}
                  className={`rounded-2xl border p-5 transition ${
                    draft.flexibleMonth === value ? "border-muted-900 bg-muted-50" : "border-border hover:border-muted-900"
                  }`}
                >
                  <CalendarDays className="mx-auto h-8 w-8 text-muted-500" />
                  <span className="mt-4 block text-sm font-black text-muted-900">
                    {month.toLocaleString("en", { month: "long" })}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-muted-600">{month.getFullYear()}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function WhoPopover({
  guests,
  onGuestsChange,
}: {
  guests: BookingGuestCounts;
  onGuestsChange: (guests: BookingGuestCounts) => void;
}) {
  return (
    <div className="absolute right-0 top-[4.9rem] z-50 w-[33rem] rounded-[2rem] bg-white p-8 shadow-[0_22px_70px_rgba(15,23,42,0.22)]">
      <GuestCounters guests={guests} onGuestsChange={onGuestsChange} />
    </div>
  );
}

function GuestCounters({
  guests,
  onGuestsChange,
}: {
  guests: BookingGuestCounts;
  onGuestsChange: (guests: BookingGuestCounts) => void;
}) {
  return (
    <div className="divide-y divide-border">
      <GuestCounter label="Adults" hint="Ages 13 or above" value={guests.adults} onChange={(value) => onGuestsChange({ ...guests, adults: value })} />
      <GuestCounter label="Children" hint="Ages 2 - 12" value={guests.children} onChange={(value) => onGuestsChange({ ...guests, children: value })} />
      <GuestCounter label="Infants" hint="Under 2" value={guests.infants} onChange={(value) => onGuestsChange({ ...guests, infants: value })} />
      <GuestCounter label="Pets" hint="Service animals welcome" value={guests.pets} onChange={(value) => onGuestsChange({ ...guests, pets: value })} />
    </div>
  );
}

function GuestCounter({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-5 first:pt-0 last:pb-0">
      <div>
        <p className="text-lg font-black text-muted-900">{label}</p>
        <p className="mt-1 text-sm font-semibold text-muted-500">{hint}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-500 transition hover:border-muted-900 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-5 text-center text-lg font-black text-muted-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-700 transition hover:border-muted-900"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function MobilePanel({ title, value, children }: { title: string; value: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-muted-900">{title}</h2>
        <p className="min-w-0 truncate text-sm font-bold text-muted-500">{value}</p>
      </div>
      {children}
    </section>
  );
}

function CalendarMonth({
  month,
  selectedStart,
  selectedEnd,
  onSelect,
}: {
  month: Date;
  selectedStart: string;
  selectedEnd: string;
  onSelect: (value: string) => void;
}) {
  const days = calendarDays(month);

  return (
    <div>
      <h3 className="text-center text-lg font-black text-muted-900">
        {month.toLocaleString("en", { month: "long", year: "numeric" })}
      </h3>
      <div className="mt-5 grid grid-cols-7 text-center text-xs font-black text-muted-500">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span key={`${day}-${index}`} className="py-2">{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {days.map((day, index) => {
          if (!day) return <span key={`empty-${month.toISOString()}-${index}`} className="h-11" />;

          const value = isoDate(day);
          const selected = value === selectedStart || value === selectedEnd;
          const inRange = selectedStart && selectedEnd && value > selectedStart && value < selectedEnd;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              className={`mx-auto grid h-11 w-11 place-items-center rounded-full text-sm font-black transition ${
                selected ? "bg-muted-900 text-white" : inRange ? "bg-muted-100 text-muted-900" : "text-muted-800 hover:bg-muted-100"
              }`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function destinationSuggestions(rooms: AvailableRoom[]): DestinationSuggestion[] {
  const suggestions = new Map<string, DestinationSuggestion>();

  suggestions.set("nearby", {
    id: "nearby",
    label: "Nearby",
    subtitle: "Find what is around you",
    search: "",
    tenantSlug: "",
    kind: "nearby",
  });

  rooms.forEach((room) => {
    suggestions.set(`tenant:${room.tenant_slug}`, {
      id: `tenant:${room.tenant_slug}`,
      label: room.tenant_name,
      subtitle: "Hostel rooms and blocks",
      search: room.tenant_name,
      tenantSlug: room.tenant_slug,
      kind: "hostel",
    });

    if (room.block_name) {
      suggestions.set(`block:${room.tenant_slug}:${room.block_id}`, {
        id: `block:${room.tenant_slug}:${room.block_id}`,
        label: room.block_name,
        subtitle: room.tenant_name,
        search: room.block_name,
        tenantSlug: room.tenant_slug,
        kind: "block",
      });
    }

    if (room.location) {
      suggestions.set(`location:${room.location.toLowerCase()}`, {
        id: `location:${room.location.toLowerCase()}`,
        label: room.location,
        subtitle: "For hostels in this area",
        search: room.location,
        tenantSlug: "",
        kind: "location",
      });
    }
  });

  return Array.from(suggestions.values());
}

function selectDate(value: string, onDraftChange: (updater: (current: BookingSearchIntent) => BookingSearchIntent) => void) {
  onDraftChange((current) => {
    if (!current.checkInDate || (current.checkInDate && current.checkOutDate) || value < current.checkInDate) {
      return { ...current, dateMode: "dates", checkInDate: value, checkOutDate: "" };
    }

    return { ...current, dateMode: "dates", checkOutDate: value };
  });
}

function emptyIntent(): BookingSearchIntent {
  return {
    destinationLabel: "",
    destinationSearch: "",
    tenantSlug: "",
    dateMode: "dates",
    checkInDate: "",
    checkOutDate: "",
    flexibleStay: "Weekend",
    flexibleMonth: "",
    guests: {
      adults: 0,
      children: 0,
      infants: 0,
      pets: 0,
    },
  };
}

function normalizeIntent(intent: BookingSearchIntent): BookingSearchIntent {
  return {
    ...intent,
    destinationLabel: intent.destinationLabel.trim(),
    destinationSearch: intent.destinationSearch.trim(),
    tenantSlug: intent.tenantSlug.trim(),
  };
}

function hasSearchIntent(intent: BookingSearchIntent): boolean {
  return Boolean(
    intent.destinationSearch ||
    intent.checkInDate ||
    intent.checkOutDate ||
    intent.flexibleMonth ||
    Object.values(intent.guests).some((value) => value > 0),
  );
}

function formatWhen(intent: BookingSearchIntent): string {
  if (intent.dateMode === "flexible" && intent.flexibleMonth) {
    return `${intent.flexibleStay} in ${formatMonthKey(intent.flexibleMonth)}`;
  }

  if (intent.checkInDate && intent.checkOutDate) {
    return `${formatShortDate(intent.checkInDate)} - ${formatShortDate(intent.checkOutDate)}`;
  }

  if (intent.checkInDate) {
    return formatShortDate(intent.checkInDate);
  }

  return "";
}

function formatGuests(guests: BookingGuestCounts): string {
  const people = guests.adults + guests.children;
  const parts = [];

  if (people > 0) parts.push(`${people} guest${people === 1 ? "" : "s"}`);
  if (guests.infants > 0) parts.push(`${guests.infants} infant${guests.infants === 1 ? "" : "s"}`);
  if (guests.pets > 0) parts.push(`${guests.pets} pet${guests.pets === 1 ? "" : "s"}`);

  return parts.join(", ");
}

function formatShortDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleString("en", { month: "short", day: "numeric" });
}

function formatMonthKey(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en", { month: "long" });
}

function calendarDays(month: Date): Array<Date | null> {
  const first = monthStart(month);
  const totalDays = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const leading = first.getDay();
  const days: Array<Date | null> = Array.from({ length: leading }, () => null);

  for (let day = 1; day <= totalDays; day += 1) {
    days.push(new Date(first.getFullYear(), first.getMonth(), day));
  }

  return days;
}

function upcomingMonths(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, index) => addMonths(monthStart(start), index));
}

function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
