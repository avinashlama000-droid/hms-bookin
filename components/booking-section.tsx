"use client";

import { ArrowRight, BedDouble, CheckCircle2, ChevronLeft, ChevronRight, Clock, Filter, MapPin, Search, Utensils, X } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  attachmentUrl,
  type ApiErrorBody,
  type AvailableRoom,
  type BookingPayload,
  type BookingResponse,
  type PublicMealMenu,
  type PublicMealMenuContent,
} from "@/lib/booking";

type BookingSectionProps = {
  rooms: AvailableRoom[];
  mealMenus?: PublicMealMenu[];
  variant?: "full" | "compact";
  showMealMenuPanel?: boolean;
};

type BookingFormState = {
  name: string;
  email: string;
  phone: string;
  description: string;
};

const initialForm: BookingFormState = {
  name: "",
  email: "",
  phone: "",
  description: "",
};

const WEEK_DAYS = [
  ["sunday", "Sunday"],
  ["monday", "Monday"],
  ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"],
  ["thursday", "Thursday"],
  ["friday", "Friday"],
  ["saturday", "Saturday"],
] as const;

const MEAL_KEYS = [
  ["breakfast", "Breakfast"],
  ["lunch", "Lunch"],
  ["snacks", "Snacks"],
  ["dinner", "Dinner"],
] as const;

async function createBookingInquiry(payload: BookingPayload): Promise<BookingResponse> {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => ({}))) as BookingResponse & ApiErrorBody;

  if (!response.ok) {
    const firstValidationMessage = body.errors ? Object.values(body.errors).flat()[0] : null;
    throw new Error(firstValidationMessage || body.message || "Booking inquiry could not be sent.");
  }

  return body;
}

export function BookingSection({
  rooms,
  mealMenus = [],
  variant = "full",
  showMealMenuPanel = true,
}: BookingSectionProps) {
  const [search, setSearch] = useState("");
  const [tenant, setTenant] = useState("all");
  const [roomType, setRoomType] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null);
  const [selectedMealMenu, setSelectedMealMenu] = useState<PublicMealMenu | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [compactRoomIndex, setCompactRoomIndex] = useState(0);
  const compactRoomsRef = useRef<HTMLDivElement>(null);

  const tenantOptions = useMemo(() => {
    const options = new Map<string, string>();

    rooms.forEach((room) => options.set(room.tenant_slug, room.tenant_name));
    mealMenus.forEach((menu) => options.set(menu.tenant_slug, menu.tenant_name));

    return Array.from(options.entries()).sort(([, firstName], [, secondName]) =>
      firstName.localeCompare(secondName),
    );
  }, [mealMenus, rooms]);

  const menuByBlock = useMemo(
    () => new Map(mealMenus.map((menu) => [blockMenuKey(menu), menu])),
    [mealMenus],
  );

  const roomTypes = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.room_type).filter(Boolean))).sort(),
    [rooms],
  );

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesTenant = tenant === "all" || room.tenant_slug === tenant;
      const matchesType = roomType === "all" || room.room_type === roomType;
      const haystack = [
        room.tenant_name,
        room.block_name,
        room.location,
        room.room_name,
        room.room_type,
        room.floor,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesTenant && matchesType && (!query || haystack.includes(query));
    });
  }, [rooms, roomType, search, tenant]);

  useEffect(() => {
    setCompactRoomIndex((current) => Math.min(current, Math.max(filteredRooms.length - 1, 0)));
  }, [filteredRooms.length]);

  const visibleRoomMenuKeys = useMemo(
    () => new Set(filteredRooms.map((room) => blockMenuKey(room))),
    [filteredRooms],
  );

  const filteredMealMenus = useMemo(() => {
    const query = search.trim().toLowerCase();

    return mealMenus.filter((menu) => {
      const matchesVisibleRoom = visibleRoomMenuKeys.has(blockMenuKey(menu));
      const matchesTenant = tenant === "all" || menu.tenant_slug === tenant;
      const haystack = [menu.tenant_name, menu.block_name, menu.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesVisibleRoom && matchesTenant && (!query || haystack.includes(query));
    });
  }, [mealMenus, search, tenant, visibleRoomMenuKeys]);

  const hasActiveFilters = Boolean(search.trim()) || tenant !== "all" || roomType !== "all";
  const activeCompactRoom = filteredRooms[compactRoomIndex] ?? null;
  const activeCompactMealMenu = activeCompactRoom ? menuByBlock.get(blockMenuKey(activeCompactRoom)) : undefined;

  function openBooking(room: AvailableRoom) {
    setSelectedRoom(room);
    setError("");
    setSuccess("");
    setForm(initialForm);
  }

  function syncCompactRoomFromScroll() {
    const container = compactRoomsRef.current;
    if (!container) return;

    const viewportCenter = container.scrollLeft + container.clientWidth / 2;
    const nextIndex = Array.from(container.children).reduce((closestIndex, child, index) => {
      const element = child as HTMLElement;
      const current = container.children.item(closestIndex) as HTMLElement | null;
      const childDistance = Math.abs(element.offsetLeft + element.offsetWidth / 2 - viewportCenter);
      const closestDistance = current
        ? Math.abs(current.offsetLeft + current.offsetWidth / 2 - viewportCenter)
        : Number.POSITIVE_INFINITY;

      return childDistance < closestDistance ? index : closestIndex;
    }, 0);

    setCompactRoomIndex((current) => (current === nextIndex ? current : nextIndex));
  }

  function scrollCompactRooms(direction: "left" | "right") {
    const container = compactRoomsRef.current;
    const lastIndex = filteredRooms.length - 1;
    if (!container || lastIndex < 0) return;

    const nextIndex = direction === "left"
      ? Math.max(compactRoomIndex - 1, 0)
      : Math.min(compactRoomIndex + 1, lastIndex);

    setCompactRoomIndex(nextIndex);
    const nextRoom = container.children.item(nextIndex) as HTMLElement | null;
    nextRoom?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRoom) return;

    const payload: BookingPayload = {
      tenant_slug: selectedRoom.tenant_slug,
      block_id: selectedRoom.block_id,
      room_id: selectedRoom.room_id,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      description: form.description.trim() || undefined,
    };

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await createBookingInquiry(payload);
      setSuccess(
        response.data?.inquiry_number
          ? `Inquiry ${response.data.inquiry_number} was sent.`
          : "Inquiry was sent.",
      );
      setForm(initialForm);
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : "Booking inquiry could not be sent.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (variant === "compact") {
    return (
      <div className="flex min-h-0 flex-col rounded-lg border border-border bg-white p-3 shadow-soft sm:p-4 lg:min-h-[620px]">
        <div className="mb-3 flex items-start justify-between gap-3 border-b border-border pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-brand-700">
              Available rooms
            </p>
            <h2 className="mt-1 text-base font-bold text-muted-900">
              Ready for inquiry
            </h2>
          </div>
          <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
            {filteredRooms.length}
          </span>
        </div>

        {activeCompactMealMenu?.menu && (
          <MealMenuPanel menus={[activeCompactMealMenu]} onViewMenu={setSelectedMealMenu} compact />
        )}

        {filteredRooms.length > 0 ? (
          <div className="relative flex min-h-[460px] flex-1">
            <div
              ref={compactRoomsRef}
              onScroll={syncCompactRoomFromScroll}
              className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {filteredRooms.map((room) => (
                <CompactRoomRow
                  key={`${room.tenant_slug}-${room.room_id}`}
                  room={room}
                  mealMenu={menuByBlock.get(blockMenuKey(room))}
                  onBook={openBooking}
                  onViewMenu={setSelectedMealMenu}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => scrollCompactRooms("left")}
              className="absolute left-0 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-border bg-white text-brand-700 shadow-soft transition hover:bg-brand-50 sm:flex"
              aria-label="Scroll rooms left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollCompactRooms("right")}
              className="absolute right-0 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-border bg-white text-brand-700 shadow-soft transition hover:bg-brand-50 sm:flex"
              aria-label="Scroll rooms right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex min-h-[420px] flex-1 flex-col items-center justify-center rounded-lg border border-border bg-surface-subtle px-4 py-6 text-center">
            <BedDouble className="mx-auto h-8 w-8 text-muted-400" />
            <p className="mt-3 text-sm font-bold text-muted-900">No rooms available</p>
          </div>
        )}

        {selectedRoom && (
          <BookingDialog
            room={selectedRoom}
            form={form}
            setForm={setForm}
            error={error}
            success={success}
            isSubmitting={isSubmitting}
            onClose={() => setSelectedRoom(null)}
            onSubmit={submitBooking}
          />
        )}

        {selectedMealMenu && (
          <MealMenuDialog menu={selectedMealMenu} onClose={() => setSelectedMealMenu(null)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card sticky top-[4.75rem] z-30 rounded-ui p-3">
        <div className="mb-3 flex flex-col gap-2 border-b border-white/70 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">Room finder</p>
            <p className="mt-1 text-sm font-bold text-muted-700">
              {filteredRooms.length} of {rooms.length} rooms match your search
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setTenant("all");
                setRoomType("all");
              }}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-ui border border-brand-100 bg-white px-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
            >
              <X className="h-4 w-4" />
              Reset filters
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_190px_190px]">
        <label className="relative block">
          <span className="sr-only">Search rooms</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by hostel, block, room, or location"
            className="h-11 w-full rounded-ui border border-white/80 bg-white pl-10 pr-3 text-sm font-bold text-muted-900 shadow-crisp outline-none transition placeholder:text-muted-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="relative block">
          <span className="sr-only">Filter hostel</span>
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-400" />
          <select
            value={tenant}
            onChange={(event) => setTenant(event.target.value)}
            className="h-11 w-full appearance-none rounded-ui border border-white/80 bg-white pl-10 pr-3 text-sm font-bold text-muted-800 shadow-crisp outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="all">All hostels</option>
            {tenantOptions.map(([slug, name]) => (
              <option key={slug} value={slug}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="relative block">
          <span className="sr-only">Filter room type</span>
          <BedDouble className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-400" />
          <select
            value={roomType}
            onChange={(event) => setRoomType(event.target.value)}
            className="h-11 w-full appearance-none rounded-ui border border-white/80 bg-white pl-10 pr-3 text-sm font-bold text-muted-800 shadow-crisp outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="all">All types</option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {formatRoomType(type)}
              </option>
            ))}
          </select>
        </label>
        </div>
      </div>

      {showMealMenuPanel && mealMenus.length > 0 && (
        <MealMenuPanel menus={filteredMealMenus} onViewMenu={setSelectedMealMenu} />
      )}

      {filteredRooms.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCard
              key={`${room.tenant_slug}-${room.room_id}`}
              room={room}
              mealMenu={menuByBlock.get(blockMenuKey(room))}
              onBook={openBooking}
              onViewMenu={setSelectedMealMenu}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-ui px-5 py-12 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-700 shadow-lift">
            <BedDouble className="h-8 w-8" />
          </span>
          <p className="mt-4 text-lg font-black text-muted-900">No available rooms found</p>
          <p className="mt-2 text-sm leading-6 text-muted-600">
            Try a different hostel, room type, or search term.
          </p>
        </div>
      )}

      {selectedRoom && (
        <BookingDialog
          room={selectedRoom}
          form={form}
          setForm={setForm}
          error={error}
          success={success}
          isSubmitting={isSubmitting}
          onClose={() => setSelectedRoom(null)}
          onSubmit={submitBooking}
        />
      )}

      {selectedMealMenu && (
        <MealMenuDialog menu={selectedMealMenu} onClose={() => setSelectedMealMenu(null)} />
      )}
    </div>
  );
}

function MealMenuPanel({
  menus,
  onViewMenu,
  compact = false,
}: {
  menus: PublicMealMenu[];
  onViewMenu: (menu: PublicMealMenu) => void;
  compact?: boolean;
}) {
  if (menus.length === 0) {
    return (
      <div className="rounded-ui border border-dashed border-brand-100 bg-white/80 px-4 py-5 text-center shadow-crisp">
        <Utensils className="mx-auto h-6 w-6 text-brand-300" />
        <p className="mt-2 text-sm font-black text-muted-900">No published meal menus found</p>
      </div>
    );
  }

  return (
    <section className={compact ? "mb-3" : "space-y-3"}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">
            Published meal menus
          </p>
          {!compact ? (
            <h2 className="mt-1 text-lg font-bold text-muted-900">By hostel block</h2>
          ) : null}
        </div>
        <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
          {menus.length}
        </span>
      </div>

      <div className={compact ? "flex gap-2 overflow-x-auto pb-1" : "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"}>
        {menus.map((menu) => (
          <button
            key={blockMenuKey(menu)}
            type="button"
            onClick={() => onViewMenu(menu)}
          className={`min-w-0 rounded-ui border border-white/80 bg-white text-left shadow-crisp transition hover:border-brand-200 hover:bg-brand-50 hover:shadow-soft ${
            compact ? "w-56 shrink-0 px-3 py-2" : "px-4 py-3"
          }`}
          >
            <span className="flex items-start gap-2">
              <Utensils className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-muted-900">
                  {menu.block_name || "Hostel block"}
                </span>
                <span className="mt-1 block truncate text-xs font-semibold text-muted-600">
                  {menu.tenant_name}
                </span>
                {menu.location ? (
                  <span className="mt-1 block truncate text-xs text-muted-500">{menu.location}</span>
                ) : null}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CompactRoomRow({
  room,
  mealMenu,
  onBook,
  onViewMenu,
}: {
  room: AvailableRoom;
  mealMenu?: PublicMealMenu;
  onBook: (room: AvailableRoom) => void;
  onViewMenu: (menu: PublicMealMenu) => void;
}) {
  const image = roomImage(room);

  return (
    <article className="flex min-h-full w-full min-w-full shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      <div className="relative h-60 overflow-hidden bg-surface-header">
        {image ? (
          <img src={image} alt={room.room_name} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-subtle">
            <BedDouble className="h-16 w-16 text-muted-300" aria-hidden="true" />
          </div>
        )}
        {image ? (
          <div className="absolute inset-0 bg-gradient-to-t from-muted-900/70 via-muted-900/10 to-transparent" />
        ) : null}
        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          <p
            className={`min-w-0 truncate rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-normal shadow-sm ${
              image ? "bg-white/90 text-brand-700 backdrop-blur-sm" : "bg-white text-brand-700"
            }`}
          >
            {room.tenant_name}
          </p>
          <span className="shrink-0 rounded-lg bg-status-successSoft px-2 py-1 text-xs font-bold text-status-success shadow-sm">
            {room.vacant_beds} vacant
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className={`truncate text-xl font-bold ${image ? "text-white" : "text-muted-900"}`}>
            {room.room_name}
          </h3>
          <p className={`mt-1 truncate text-sm font-medium ${image ? "text-white/85" : "text-muted-500"}`}>
            {formatRoomType(room.room_type)} - {formatRate(room.monthly_rate)}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:py-5 sm:pl-[30px] sm:pr-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <RoomFact label="Type" value={formatRoomType(room.room_type)} />
          <RoomFact label="Capacity" value={`${room.capacity} beds`} />
          <RoomFact label="Rate" value={formatRate(room.monthly_rate)} />
          <RoomFact label="Floor" value={room.floor || "Not set"} />
        </div>

        <div className="mt-5 flex items-start gap-2 text-sm text-muted-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-400" />
          <span className="line-clamp-2">
            {room.block_name || "Block"}
            {room.location ? `, ${room.location}` : ""}
          </span>
        </div>

        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onBook(room)}
            className="h-11 w-full rounded-lg bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Book now
          </button>
          <button
            type="button"
            onClick={() => mealMenu && onViewMenu(mealMenu)}
            disabled={!mealMenu?.menu}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-bold text-muted-700 transition hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Utensils className="h-4 w-4" />
            Meal menu
          </button>
        </div>
      </div>
    </article>
  );
}

function BookingDialog({
  room,
  form,
  setForm,
  error,
  success,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  room: AvailableRoom;
  form: BookingFormState;
  setForm: Dispatch<SetStateAction<BookingFormState>>;
  error: string;
  success: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-muted-900/50 px-4 py-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-lg rounded-ui border border-white/70 bg-white p-5 shadow-deep">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">
              Book room
            </p>
            <h3 className="mt-1 text-2xl font-black text-muted-900">{room.room_name}</h3>
            <p className="mt-1 text-sm text-muted-600">
              {room.tenant_name} - {room.block_name || "Block"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-ui border border-border text-muted-600 transition hover:bg-muted-100"
            aria-label="Close booking form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="rounded-ui border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
            <CheckCircle2 className="h-6 w-6" />
            <p className="mt-3 text-base font-bold">{success}</p>
            <p className="mt-2 text-sm leading-6">
              The hostel admin can now review your inquiry and follow up.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 h-10 rounded-ui bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              label="Full name"
              value={form.name}
              onChange={(value) => setForm((current) => ({ ...current, name: value }))}
              required
            />
            <FormField
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => setForm((current) => ({ ...current, email: value }))}
              required
            />
            <FormField
              label="Phone"
              value={form.phone}
              onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
              required
            />
            <label className="block">
              <span className="text-sm font-bold text-muted-800">Message</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={3}
                className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm text-muted-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Preferred move-in date or any question"
              />
            </label>
            {error && (
              <p className="rounded-ui border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="glass-button h-11 w-full rounded-ui px-4 text-sm font-black text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending inquiry..." : "Send booking inquiry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function MealMenuDialog({ menu, onClose }: { menu: PublicMealMenu; onClose: () => void }) {
  const content = menu.menu;
  const weeklyRows = content ? weeklyMenuRows(content.weekly_menu) : [];
  const summaryMeals = content ? mealSummary(content) : [];

  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-muted-900/50 px-4 py-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="max-h-[90svh] w-full max-w-3xl overflow-hidden rounded-ui border border-white/70 bg-white shadow-deep">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand-700">
              <Utensils className="h-4 w-4" />
              Meal menu
            </p>
            <h3 className="mt-1 text-2xl font-black text-muted-900">{menu.block_name || "Hostel block"}</h3>
            <p className="mt-1 text-sm text-muted-600">
              {menu.tenant_name}
              {menu.location ? ` - ${menu.location}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-ui border border-border text-muted-600 transition hover:bg-muted-100"
            aria-label="Close meal menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(90svh-112px)] overflow-y-auto p-5">
          {!content ? (
            <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-6 text-center">
              <Utensils className="mx-auto h-8 w-8 text-muted-400" />
              <p className="mt-3 text-sm font-bold text-muted-900">Meal menu not published yet</p>
            </div>
          ) : weeklyRows.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="min-w-[640px] w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-subtle">
                    <th className="w-32 border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-normal text-muted-500">
                      Day
                    </th>
                    <th className="w-28 border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-normal text-muted-500">
                      Time
                    </th>
                    <th className="w-36 border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-normal text-muted-500">
                      Meal
                    </th>
                    <th className="border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-normal text-muted-500">
                      Menu
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {weeklyRows.map((row, index) => (
                    <tr key={`${row.day}-${row.label}-${row.time || index}`} className="align-top">
                      <td className="px-4 py-3 text-sm font-bold text-muted-900">{row.day}</td>
                      <td className="px-4 py-3 text-sm font-medium text-muted-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-400" />
                          {row.time || "Not set"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-muted-700">{row.label}</td>
                      <td className="whitespace-pre-wrap px-4 py-3 text-sm leading-6 text-muted-700">
                        {row.value || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : summaryMeals.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {summaryMeals.map((meal) => (
                <div key={meal.label} className="rounded-lg border border-border bg-surface-subtle p-4">
                  <p className="text-xs font-bold uppercase tracking-normal text-muted-500">{meal.label}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-800">{meal.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-6 text-center">
              <p className="text-sm font-bold text-muted-900">Meal menu not published yet</p>
            </div>
          )}

          {content?.published_at ? (
            <p className="mt-4 text-xs font-semibold text-muted-500">
              Published {formatPublishedDate(content.published_at)}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RoomCard({
  room,
  mealMenu,
  onBook,
  onViewMenu,
}: {
  room: AvailableRoom;
  mealMenu?: PublicMealMenu;
  onBook: (room: AvailableRoom) => void;
  onViewMenu: (menu: PublicMealMenu) => void;
}) {
  const image = roomImage(room);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-ui border border-white/80 bg-white shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-header">
        {image ? (
          <img src={image} alt={room.room_name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#e9eef4,#f8fafc_45%,#dbeafe)]">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-white/70 text-brand-700 shadow-lift">
              <BedDouble className="h-10 w-10" aria-hidden="true" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-muted-900/76 via-muted-900/10 to-transparent" />
        <span className="absolute right-4 top-4 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 shadow-crisp">
          {room.vacant_beds} vacant
        </span>
        <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-brand-800 shadow-crisp backdrop-blur">
          {room.tenant_name}
        </span>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="truncate text-xs font-black uppercase tracking-[0.14em] text-white/80">
            {room.block_name || "Hostel block"}
          </p>
          <h3 className="mt-1 truncate text-2xl font-black text-white">{room.room_name}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-bold text-muted-600">{formatRoomType(room.room_type)}</p>
          <p className="shrink-0 text-base font-black text-muted-900">{formatRate(room.monthly_rate)}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <RoomFact label="Capacity" value={`${room.capacity} beds`} />
          <RoomFact label="Available" value={`${room.vacant_beds} beds`} />
          <RoomFact label="Floor" value={room.floor || "Not set"} />
          <RoomFact label="Meals" value={mealMenu?.menu ? "Published" : "Ask hostel"} />
        </div>

        <div className="mt-4 flex items-start gap-2 text-sm text-muted-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-400" />
          <span className="line-clamp-2">
            {room.block_name || "Block"}
            {room.location ? `, ${room.location}` : ""}
          </span>
        </div>

        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onBook(room)}
            className="glass-button inline-flex h-11 w-full items-center justify-center gap-2 rounded-ui px-4 text-sm font-black text-white transition hover:brightness-105"
          >
            Book now
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => mealMenu && onViewMenu(mealMenu)}
            disabled={!mealMenu?.menu}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-ui border border-border bg-white px-3 text-sm font-black text-muted-700 transition hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Utensils className="h-4 w-4" />
            Meal menu
          </button>
        </div>
      </div>
    </article>
  );
}

function blockMenuKey(item: Pick<AvailableRoom | PublicMealMenu, "tenant_slug" | "block_id">): string {
  return `${item.tenant_slug}:${item.block_id}`;
}

function roomImage(room: AvailableRoom): string | null {
  return attachmentUrl(room.room_attachment) || attachmentUrl(room.block_attachment);
}

function RoomFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-ui bg-surface-subtle px-3 py-2 ring-1 ring-border/60">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-500">{label}</p>
      <p className="mt-1 truncate font-black text-muted-900">{value}</p>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-muted-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 h-11 w-full rounded-ui border border-border px-3 text-sm font-semibold text-muted-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}

function formatRoomType(type: string): string {
  return type
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatRate(value: string | number | null): string {
  if (value === null || value === undefined || value === "") return "Ask admin";

  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);

  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(numeric);
}

type WeeklyMenuRow = {
  day: string;
  time: string | null;
  label: string;
  value: string;
};

function weeklyMenuRows(weeklyMenu: unknown): WeeklyMenuRow[] {
  if (!weeklyMenu || typeof weeklyMenu !== "object") return [];

  return WEEK_DAYS.flatMap(([dayKey, dayLabel]) => {
    const value = (weeklyMenu as Record<string, unknown>)[dayKey];

    if (Array.isArray(value)) {
      return value
        .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object"))
        .map((entry) => ({
          day: dayLabel,
          time: cleanString(entry.time),
          label: cleanString(entry.key) || "Meal",
          value: cleanString(entry.value) || "",
        }))
        .filter((entry) => Boolean(entry.time || entry.label || entry.value));
    }

    if (value && typeof value === "object") {
      const dayMeals = value as Record<string, unknown>;
      return MEAL_KEYS
        .map(([mealKey, mealLabel]) => ({
          day: dayLabel,
          time: null,
          label: mealLabel,
          value: cleanString(dayMeals[mealKey]) || "",
        }))
        .filter((entry) => Boolean(entry.value));
    }

    return [];
  });
}

function mealSummary(menu: PublicMealMenuContent): Array<{ label: string; value: string }> {
  return MEAL_KEYS
    .map(([key, label]) => ({ label, value: cleanString(menu[key]) || "" }))
    .filter((meal) => Boolean(meal.value));
}

function cleanString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function formatPublishedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
