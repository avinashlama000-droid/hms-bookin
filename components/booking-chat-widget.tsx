"use client";

import { BedDouble, Bot, Loader2, MapPin, MessageCircle, Send, Utensils, X } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type AvailableRoom,
  type BookingAssistantContact,
  type BookingAssistantHistoryItem,
  type BookingAssistantPayload,
  type BookingAssistantPrefill,
  type BookingAssistantResponse,
  type PublicLocation,
  type PublicMealMenu,
} from "@/lib/booking";
import { type BookingSearchIntent, useBookingSearch } from "./booking-search-context";

type ChatMessage = BookingAssistantHistoryItem & {
  id: string;
};

type BookingChatWidgetProps = {
  rooms: AvailableRoom[];
  locations: PublicLocation[];
  mealMenus: PublicMealMenu[];
};

const starterPrompts = [
  "Find available rooms",
  "Show hostel locations",
  "See meal menu",
  "How do I book?",
];

const emptyContact: BookingAssistantContact = {
  name: "",
  email: "",
  phone: "",
};

export function BookingChatWidget({ rooms, locations, mealMenus }: BookingChatWidgetProps) {
  const bookingSearch = useBookingSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi, I can help you find available hostel rooms, locations, meal menus, and send a booking inquiry.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [lastResponse, setLastResponse] = useState<BookingAssistantResponse | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<BookingAssistantPrefill | null>(null);
  const [contact, setContact] = useState(emptyContact);
  const [showContactForm, setShowContactForm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("hms-booking-chat-session");
    const next = stored || makeSessionId();
    window.localStorage.setItem("hms-booking-chat-session", next);
    setSessionId(next);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, lastResponse, showContactForm]);

  const selectedRoomDetails = useMemo(() => {
    if (!selectedRoom) return null;

    return (
      rooms.find((room) =>
        room.tenant_slug === selectedRoom.tenant_slug &&
        room.block_id === selectedRoom.block_id &&
        room.room_id === selectedRoom.room_id
      ) || null
    );
  }, [rooms, selectedRoom]);

  async function sendMessage(nextMessage: string, options: Partial<BookingAssistantPayload> = {}) {
    const cleanMessage = nextMessage.trim();
    if (!cleanMessage || !sessionId || isSending) return;

    const userMessage: ChatMessage = {
      id: makeMessageId(),
      role: "user",
      content: cleanMessage,
    };
    const nextMessages = [...messages, userMessage].slice(-12);

    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: cleanMessage,
          selected_room: options.selected_room ?? selectedRoom,
          contact: options.contact ?? null,
          history: nextMessages.slice(-10).map(({ role, content }) => ({ role, content })),
        } satisfies BookingAssistantPayload),
      });

      const body = (await response.json().catch(() => null)) as (BookingAssistantResponse & { errors?: Record<string, string[]> }) | null;

      if (!response.ok || !body) {
        const firstValidationMessage = body?.errors ? Object.values(body.errors).flat()[0] : null;
        throw new Error(firstValidationMessage || body?.message || "Booking chat could not respond.");
      }

      const assistantMessage: ChatMessage = {
        id: makeMessageId(),
        role: "assistant",
        content: body.message,
      };

      setMessages((current) => [...current, assistantMessage].slice(-12));
      setLastResponse(body);

      if (body.booking_prefill) {
        setSelectedRoom(body.booking_prefill);
      }

      if (body.booking) {
        setShowContactForm(false);
        setContact(emptyContact);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Booking chat could not respond.");
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRoom) {
      setError("Choose a room before sending the booking inquiry.");
      return;
    }

    void sendMessage("Create my booking inquiry from this chat.", {
      selected_room: selectedRoom,
      contact,
    });
  }

  function handleSuggestion(suggestion: string) {
    const normalized = suggestion.toLowerCase();

    if (normalized.includes("map") || normalized.includes("location")) {
      jumpToSection("location");
    }

    if (normalized.includes("meal")) {
      jumpToSection("meal-menu");
    }

    if (normalized.includes("room") || normalized.includes("compare")) {
      applyRoomSearch(lastResponse?.matches.rooms[0]);
      jumpToSection("available-rooms");
    }

    if (normalized.includes("book") || normalized.includes("inquiry")) {
      const room = lastResponse?.matches.rooms[0];
      if (room) {
        selectRoom(room);
      }
      setShowContactForm(true);
      return;
    }

    void sendMessage(suggestion);
  }

  function selectRoom(room: AvailableRoom) {
    const prefill = {
      tenant_slug: room.tenant_slug,
      block_id: room.block_id,
      room_id: room.room_id,
    };

    setSelectedRoom(prefill);
    setShowContactForm(true);
    applyRoomSearch(room);
  }

  function applyRoomSearch(room?: AvailableRoom) {
    if (!bookingSearch) return;

    const destination = room?.block_name || room?.tenant_name || "";
    const intent: BookingSearchIntent = {
      destinationLabel: destination,
      destinationSearch: destination,
      tenantSlug: room?.tenant_slug || "",
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

    bookingSearch.applyIntent(intent);
  }

  function jumpToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const responseRooms = lastResponse?.matches.rooms.length ? lastResponse.matches.rooms : rooms.slice(0, 2);
  const responseLocations = lastResponse?.matches.locations.length ? lastResponse.matches.locations : locations.slice(0, 1);
  const responseMenus = lastResponse?.matches.meal_menus.length ? lastResponse.matches.meal_menus : mealMenus.slice(0, 1);

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      {isOpen ? (
        <section className="flex h-[min(41rem,calc(100svh-8.5rem))] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-ui border border-border-strong bg-white shadow-2xl">
          <header className="flex items-center justify-between gap-3 border-b border-border bg-surface-subtle px-3.5 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-ui bg-brand-700 text-white">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-black text-muted-900">Booking assistant</h2>
                <p className="truncate text-xs font-semibold text-muted-500">
                  Public room, meal, and location help
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-ui text-muted-500 hover:bg-white hover:text-muted-900"
              aria-label="Close booking chat"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-surface-page/60 px-3.5 py-3">
            <div className="space-y-2.5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <p
                    className={`max-w-[82%] rounded-ui px-3 py-2 text-sm leading-5 shadow-sm ${
                      message.role === "user"
                        ? "bg-brand-700 text-white"
                        : "border border-border bg-white text-muted-800"
                    }`}
                  >
                    {message.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(lastResponse?.suggestions.length ? lastResponse.suggestions : starterPrompts).slice(0, 4).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  className="rounded-full border border-brand-100 bg-white px-3 py-1.5 text-xs font-bold text-brand-800 hover:border-brand-300 hover:bg-brand-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {lastResponse ? (
              <div className="mt-3 space-y-2.5">
                {responseRooms.slice(0, 2).map((room) => (
                  <article key={`${room.tenant_slug}-${room.block_id}-${room.room_id}`} className="rounded-ui border border-border bg-white p-3">
                    <div className="flex items-start gap-2.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-ui bg-brand-50 text-brand-700">
                        <BedDouble className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-black text-muted-900">{room.room_name}</h3>
                        <p className="mt-0.5 text-xs font-semibold text-muted-500">
                          {room.tenant_name}{room.block_name ? ` / ${room.block_name}` : ""} · {room.vacant_beds} vacant
                        </p>
                        <p className="mt-1 text-xs text-muted-600">
                          {room.room_type}{room.monthly_rate ? ` · Rs. ${room.monthly_rate}` : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectRoom(room)}
                      className="mt-2.5 inline-flex h-8 items-center justify-center rounded-ui bg-brand-700 px-3 text-xs font-black text-white hover:bg-brand-800"
                    >
                      Select room
                    </button>
                  </article>
                ))}

                {lastResponse.intent === "location_search" && responseLocations.slice(0, 2).map((location) => (
                  <CompactFact
                    key={`${location.tenant_slug}-${location.block_id}`}
                    icon={<MapPin className="h-4 w-4" />}
                    title={`${location.tenant_name}${location.block_name ? ` / ${location.block_name}` : ""}`}
                    detail={`${location.location || "Mapped location"} · ${location.vacant_beds} vacant beds`}
                  />
                ))}

                {lastResponse.intent === "meal_menu" && responseMenus.slice(0, 2).map((menu) => (
                  <CompactFact
                    key={`${menu.tenant_slug}-${menu.block_id}`}
                    icon={<Utensils className="h-4 w-4" />}
                    title={`${menu.tenant_name}${menu.block_name ? ` / ${menu.block_name}` : ""}`}
                    detail={[
                      menu.menu?.breakfast,
                      menu.menu?.lunch,
                      menu.menu?.dinner,
                    ].filter(Boolean).join(" · ") || "Published menu available"}
                  />
                ))}
              </div>
            ) : null}

            {showContactForm ? (
              <form onSubmit={handleContactSubmit} className="mt-3 rounded-ui border border-border bg-white p-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-500">Send inquiry</p>
                <p className="mt-1 text-sm font-bold text-muted-900">
                  {selectedRoomDetails?.room_name || "Selected room"}
                </p>
                <div className="mt-3 grid gap-2">
                  <input
                    value={contact.name}
                    onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Full name"
                    className="h-10 rounded-ui border border-border px-3 text-sm outline-none focus:border-brand-500"
                    required
                  />
                  <input
                    value={contact.email}
                    onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))}
                    placeholder="Email"
                    type="email"
                    className="h-10 rounded-ui border border-border px-3 text-sm outline-none focus:border-brand-500"
                    required
                  />
                  <input
                    value={contact.phone}
                    onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Phone"
                    className="h-10 rounded-ui border border-border px-3 text-sm outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSending || !selectedRoom}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-ui bg-brand-700 px-3 text-sm font-black text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send booking inquiry
                </button>
              </form>
            ) : null}

            {error ? (
              <p className="mt-3 rounded-ui border border-status-danger/20 bg-status-dangerSoft px-3 py-2 text-sm font-semibold text-status-danger">
                {error}
              </p>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-border bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={500}
                placeholder="Ask about rooms, meals, or location"
                className="min-w-0 flex-1 rounded-ui border border-border px-3 text-sm outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-ui bg-brand-700 text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send booking chat message"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-[0.7rem] font-semibold text-muted-500">
              {lastResponse?.limit ? `${lastResponse.limit.remaining} messages left in this chat` : "Public booking info only"}
            </p>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-700 px-4 text-sm font-black text-white shadow-2xl hover:bg-brand-800"
        aria-label="Open booking chat"
      >
        <MessageCircle className="h-5 w-5" />
        Chat
      </button>
    </div>
  );
}

function CompactFact({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <article className="flex items-start gap-2.5 rounded-ui border border-border bg-white p-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-ui bg-brand-50 text-brand-700">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-black text-muted-900">{title}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-muted-500">{detail}</p>
      </div>
    </article>
  );
}

function makeSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `chat_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function makeMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
