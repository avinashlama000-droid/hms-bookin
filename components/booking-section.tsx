"use client";

import { BedDouble, CheckCircle2, ChevronLeft, ChevronRight, Filter, MapPin, Search, X } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useMemo, useRef, useState } from "react";
import {
  attachmentUrl,
  type ApiErrorBody,
  type AvailableRoom,
  type BookingPayload,
  type BookingResponse,
} from "@/lib/booking";

type BookingSectionProps = {
  rooms: AvailableRoom[];
  variant?: "full" | "compact";
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

export function BookingSection({ rooms, variant = "full" }: BookingSectionProps) {
  const [search, setSearch] = useState("");
  const [tenant, setTenant] = useState("all");
  const [roomType, setRoomType] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const compactRoomsRef = useRef<HTMLDivElement>(null);

  const tenantOptions = useMemo(
    () => Array.from(new Map(rooms.map((room) => [room.tenant_slug, room.tenant_name])).entries()),
    [rooms],
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

  function openBooking(room: AvailableRoom) {
    setSelectedRoom(room);
    setError("");
    setSuccess("");
    setForm(initialForm);
  }

  function scrollCompactRooms(direction: "left" | "right") {
    const container = compactRoomsRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -container.clientWidth * 0.85 : container.clientWidth * 0.85,
      behavior: "smooth",
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

        {filteredRooms.length > 0 ? (
          <div className="relative flex min-h-[460px] flex-1">
            <div
              ref={compactRoomsRef}
              className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {filteredRooms.map((room) => (
                <CompactRoomRow
                  key={`${room.tenant_slug}-${room.room_id}`}
                  room={room}
                  onBook={openBooking}
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-lg border border-border bg-white p-4 shadow-sm lg:grid-cols-[minmax(220px,1fr)_180px_180px]">
        <label className="relative block">
          <span className="sr-only">Search rooms</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by hostel, block, room, or location"
            className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm font-medium text-muted-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="relative block">
          <span className="sr-only">Filter hostel</span>
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-400" />
          <select
            value={tenant}
            onChange={(event) => setTenant(event.target.value)}
            className="h-11 w-full appearance-none rounded-lg border border-border bg-white pl-10 pr-3 text-sm font-semibold text-muted-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
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
            className="h-11 w-full appearance-none rounded-lg border border-border bg-white pl-10 pr-3 text-sm font-semibold text-muted-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
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

      {filteredRooms.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCard key={`${room.tenant_slug}-${room.room_id}`} room={room} onBook={openBooking} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-white px-5 py-10 text-center shadow-sm">
          <BedDouble className="mx-auto h-9 w-9 text-muted-400" />
          <p className="mt-3 text-base font-bold text-muted-900">No available rooms found</p>
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
    </div>
  );
}

function CompactRoomRow({
  room,
  onBook,
}: {
  room: AvailableRoom;
  onBook: (room: AvailableRoom) => void;
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

        <button
          type="button"
          onClick={() => onBook(room)}
          className="mt-auto h-11 w-full rounded-lg bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          Book now
        </button>
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
    <div className="fixed inset-0 z-[70] flex items-end bg-muted-900/45 px-4 py-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-brand-700">
              Book room
            </p>
            <h3 className="mt-1 text-xl font-bold text-muted-900">{room.room_name}</h3>
            <p className="mt-1 text-sm text-muted-600">
              {room.tenant_name} - {room.block_name || "Block"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-600 transition hover:bg-muted-100"
            aria-label="Close booking form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
            <CheckCircle2 className="h-6 w-6" />
            <p className="mt-3 text-base font-bold">{success}</p>
            <p className="mt-2 text-sm leading-6">
              The hostel admin can now review your inquiry and follow up.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 h-10 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800"
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
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending inquiry..." : "Send booking inquiry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function RoomCard({ room, onBook }: { room: AvailableRoom; onBook: (room: AvailableRoom) => void }) {
  const image = roomImage(room);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-all duration-200 hover:border-brand-200 hover:shadow-soft">
      <div className="relative aspect-[16/10] bg-surface-header">
        {image ? (
          <img src={image} alt={room.room_name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-subtle">
            <BedDouble className="h-14 w-14 text-muted-300" aria-hidden="true" />
          </div>
        )}
        {image ? (
          <div className="absolute inset-0 bg-gradient-to-t from-muted-900/65 via-muted-900/5 to-transparent" />
        ) : null}
        <span className="absolute right-4 top-4 rounded-lg bg-status-successSoft px-3 py-1 text-xs font-bold text-status-success shadow-sm">
          {room.vacant_beds} vacant
        </span>
        <div className="absolute bottom-4 left-4 right-4">
          <p
            className={`truncate text-xs font-bold uppercase tracking-normal ${
              image ? "text-white/85" : "text-brand-700"
            }`}
          >
            {room.tenant_name}
          </p>
          <h3 className={`mt-1 truncate text-xl font-bold ${image ? "text-white" : "text-muted-900"}`}>
            {room.room_name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-semibold text-muted-600">
          {formatRoomType(room.room_type)} - {formatRate(room.monthly_rate)}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <RoomFact label="Type" value={formatRoomType(room.room_type)} />
          <RoomFact label="Capacity" value={`${room.capacity} beds`} />
          <RoomFact label="Rate" value={formatRate(room.monthly_rate)} />
          <RoomFact label="Floor" value={room.floor || "Not set"} />
        </div>

        <div className="mt-4 flex items-start gap-2 text-sm text-muted-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-400" />
          <span className="line-clamp-2">
            {room.block_name || "Block"}
            {room.location ? `, ${room.location}` : ""}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onBook(room)}
          className="mt-5 h-10 w-full rounded-lg bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          Book now
        </button>
      </div>
    </article>
  );
}

function roomImage(room: AvailableRoom): string | null {
  return attachmentUrl(room.room_attachment) || attachmentUrl(room.block_attachment);
}

function RoomFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-subtle px-3 py-2">
      <p className="text-xs font-semibold text-muted-500">{label}</p>
      <p className="mt-1 truncate font-bold text-muted-900">{value}</p>
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
        className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm text-muted-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
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
