import {
  ArrowRight,
  BedDouble,
  BookOpen,
  CheckCircle2,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  Sparkles,
  Utensils,
  Wifi,
} from "lucide-react";
import type { ReactNode } from "react";
import { BookingSection } from "@/components/booking-section";
import { BookingChatWidget } from "@/components/booking-chat-widget";
import { Button } from "@/components/button";
import { MealMenuSection } from "@/components/meal-menu-section";
import { PublicLocationMap } from "@/components/public-location-map";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  attachmentUrl,
  fetchAvailableRooms,
  fetchPublicLocations,
  fetchPublicMealMenus,
  type AvailableRoom,
  type PublicLocation,
  type PublicMealMenu,
} from "@/lib/booking";
import { BookingSearchProvider } from "@/components/booking-search-context";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [availableRooms, publicLocations, mealMenus] = await Promise.all([
    fetchAvailableRooms(),
    fetchPublicLocations(),
    fetchPublicMealMenus(),
  ]);

  const stats = getPublicStats(availableRooms, publicLocations, mealMenus);

  return (
    <BookingSearchProvider>
      <main id="top" className="min-h-[100svh] bg-surface-page pt-[7.75rem] text-muted-900">
        <SiteHeader rooms={availableRooms} />
        <Hero stats={stats} rooms={availableRooms} locations={publicLocations} mealMenus={mealMenus} />
        <AvailableRoomsSection rooms={availableRooms} mealMenus={mealMenus} />
        <MealMenuSection menus={mealMenus} />
        <FacilitiesSection />
        <LocationSection locations={publicLocations} stats={stats} />
        <BookingChatWidget rooms={availableRooms} locations={publicLocations} mealMenus={mealMenus} />
        <SiteFooter />
      </main>
    </BookingSearchProvider>
  );
}

function Hero({
  stats,
  rooms,
  locations,
  mealMenus,
}: {
  stats: PublicStats;
  rooms: AvailableRoom[];
  locations: PublicLocation[];
  mealMenus: PublicMealMenu[];
}) {
  const featuredRoom = rooms[0] ?? null;
  const featuredMealMenu = featuredRoom
    ? mealMenus.find((menu) => menu.tenant_slug === featuredRoom.tenant_slug && menu.block_id === featuredRoom.block_id)
    : null;
  const featuredLocation = featuredRoom
    ? locations.find((location) => location.tenant_slug === featuredRoom.tenant_slug && location.block_id === featuredRoom.block_id) ?? null
    : locations[0] ?? null;

  return (
    <section className="futuristic-surface relative border-b border-brand-100/80 pt-8">
      <div className="pointer-events-none absolute inset-0 dashboard-grid opacity-35" aria-hidden="true" />
      <div className="container-grid relative z-10 grid min-h-[calc(80svh-3.2rem)] items-center gap-8 py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(336px,0.9fr)] lg:py-12 xl:gap-11">
        <div className="max-w-3xl">
          <div className="glass-card inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.16em] text-brand-800">
            <Sparkles className="h-4 w-4" />
            Calm hostel booking for students
          </div>
          <h1 className="mt-5 max-w-4xl text-3xl font-black leading-[1.02] text-muted-900 sm:text-4xl lg:text-5xl">
            Find your hostel room with meals, location, and availability in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-600 sm:text-base">
            Compare available hostel rooms, check the published meal menu, and send a room inquiry
            without calling every block one by one.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button href="#available-rooms" className="h-10 px-5">
              Book room
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#location" variant="secondary" className="h-10 px-4" icon={<MapPin className="h-4 w-4" />}>
              View GPS location
            </Button>
          </div>
          <div className="mt-6 grid max-w-2xl gap-2.5 sm:grid-cols-3">
            <TrustChip icon={<Search className="h-4 w-4" />} label="Live room search" />
            <TrustChip icon={<Utensils className="h-4 w-4" />} label="Meal menu check" />
            <TrustChip icon={<ShieldCheck className="h-4 w-4" />} label="Inquiry saved to HMS" />
          </div>
        </div>

        <HeroBookingPreview
          room={featuredRoom}
          mealMenu={featuredMealMenu ?? null}
          location={featuredLocation}
          stats={stats}
        />
      </div>
    </section>
  );
}

function HeroBookingPreview({
  room,
  mealMenu,
  location,
  stats,
}: {
  room: AvailableRoom | null;
  mealMenu: PublicMealMenu | null;
  location: PublicLocation | null;
  stats: PublicStats;
}) {
  const image = room ? roomImage(room) : null;

  return (
    <div className="glass-card overflow-hidden rounded-ui p-2.5">
      <div className="relative overflow-hidden rounded-ui bg-gradient-to-br from-brand-900 via-brand-700 to-signal-cyan p-2.5 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.28),transparent_38%)]" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-ui border border-white/30 bg-white text-muted-900">
          <div className="relative aspect-[16/10] bg-surface-header">
            {image ? (
              <img src={image} alt={room?.room_name || "Featured hostel room"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#e9eef4,#f8fafc_45%,#dbeafe)]">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white/70 text-brand-700">
                  <BedDouble className="h-10 w-10" />
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-muted-900/78 via-muted-900/12 to-transparent" />
            <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2.5">
              <span className="rounded-full bg-white/92 px-2.5 py-1 text-[0.7rem] font-black uppercase tracking-[0.14em] text-brand-800 backdrop-blur">
                {room ? room.tenant_name : "Live availability"}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.7rem] font-black text-emerald-700">
                {room ? `${room.vacant_beds} beds vacant` : `${stats.vacantBeds} beds vacant`}
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-white/80">
                {room?.block_name || "Student hostel room"}
              </p>
              <h2 className="mt-1 line-clamp-2 text-xl font-black leading-tight text-white">
                {room?.room_name || "Find an available room before you visit"}
              </h2>
              <p className="mt-1.5 text-xs font-semibold text-white/85">
                {room ? `${formatRoomType(room.room_type)} · ${formatRate(room.monthly_rate)}` : "Compare rooms, meals, and mapped blocks"}
              </p>
            </div>
          </div>

          <div className="grid gap-2.5 p-3 sm:grid-cols-3">
            <PreviewFact icon={<BedDouble className="h-4 w-4" />} label="Rooms" value={stats.availableRooms} detail="listed" />
            <PreviewFact icon={<Utensils className="h-4 w-4" />} label="Meals" value={stats.publishedMealMenus} detail={mealMenu?.menu ? "published" : "menus"} />
            <PreviewFact icon={<Navigation className="h-4 w-4" />} label="Maps" value={stats.mappedHostels} detail={location ? "blocks" : "ready"} />
          </div>

          <div className="border-t border-border bg-surface-subtle p-3">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <SignalPill icon={<CheckCircle2 className="h-4 w-4" />} label={mealMenu?.menu ? "Meal menu available" : "Meal menu appears when published"} />
              <SignalPill icon={<MapPin className="h-4 w-4" />} label={location?.tenant_name || "Mapped hostels appear here"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="glass-card flex items-center gap-2 rounded-ui px-2.5 py-2.5 text-xs font-bold text-muted-800">
      <span className="grid h-7 w-7 place-items-center rounded-ui bg-brand-50 text-brand-700">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function PreviewFact({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-ui bg-surface-page p-2.5">
      <div className="flex items-center gap-2 text-brand-700">
        {icon}
        <span className="text-[0.7rem] font-black uppercase tracking-[0.12em] text-muted-500">{label}</span>
      </div>
      <p className="mt-1.5 text-xl font-black text-muted-900">{value}</p>
      <p className="text-[0.7rem] font-bold text-muted-500">{detail}</p>
    </div>
  );
}

function SignalPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-ui bg-white px-2.5 py-1.5 text-xs font-bold text-muted-700">
      <span className="shrink-0 text-brand-700">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function AvailableRoomsSection({
  rooms,
  mealMenus,
}: {
  rooms: AvailableRoom[];
  mealMenus: PublicMealMenu[];
}) {
  return (
    <Section
      id="available-rooms"
      eyebrow="Available hostel rooms"
      title="Choose a room that fits your study routine."
      description="Filter by hostel, block, room type, or location. Each room keeps the live inquiry form connected to HMS."
      tone="white"
    >
      <BookingSection rooms={rooms} mealMenus={mealMenus} showMealMenuPanel={false} />
    </Section>
  );
}

function FacilitiesSection() {
  const facilities = [
    {
      title: "Study-friendly rooms",
      description: "Simple room details make it easier to compare capacity, floor, and pricing.",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Meal visibility",
      description: "Students can check breakfast, lunch, snacks, and dinner before sending an inquiry.",
      icon: <Utensils className="h-5 w-5" />,
    },
    {
      title: "Internet-ready stay",
      description: "A calm booking surface for hostels that support everyday student work.",
      icon: <Wifi className="h-5 w-5" />,
    },
    {
      title: "Safer decisions",
      description: "Mapped blocks and published availability reduce uncertainty before a visit.",
      icon: <ShieldCheck className="h-5 w-5" />,
    },
  ];

  return (
    <Section
      id="facilities"
      eyebrow="Student facilities"
      title="Everything students check before choosing a hostel."
      description="Keep the page focused on what matters first: room fit, food, study comfort, and location confidence."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {facilities.map((item) => (
          <article key={item.title} className="premium-card rounded-ui p-4 transition duration-200 hover:-translate-y-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-ui bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              {item.icon}
            </div>
            <h3 className="mt-3 text-base font-black text-muted-900">{item.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-600">{item.description}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function LocationSection({
  locations,
  stats,
}: {
  locations: PublicLocation[];
  stats: PublicStats;
}) {
  return (
    <section id="location" className="scroll-mt-24 border-b border-brand-100/80 bg-surface-page">
      <div className="container-grid py-12 sm:py-16 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch">
          <div className="flex flex-col justify-center">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-brand-700">GPS location</p>
            <h2 className="mt-2 text-xl font-black leading-tight text-muted-900 sm:text-3xl">
              See hostel blocks before you visit.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-600">
              Search mapped hostel blocks and jump from location to available rooms when beds are open.
            </p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <LocationFact icon={<MapPin className="h-4 w-4" />} label="Mapped blocks" value={stats.mappedHostels} />
              <LocationFact icon={<BedDouble className="h-4 w-4" />} label="Vacant beds" value={stats.vacantBeds} />
            </div>
          </div>

          <div className="glass-card min-h-[352px] overflow-hidden rounded-ui p-2">
            {locations.length > 0 ? (
              <div className="min-h-[352px] overflow-hidden rounded-ui">
                <PublicLocationMap locations={locations} />
              </div>
            ) : (
              <div className="flex min-h-[352px] flex-col items-center justify-center rounded-ui bg-[linear-gradient(135deg,#f8fafc,#eef3f8)] px-5 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-brand-700">
                  <MapPin className="h-6 w-6" />
                </span>
                <p className="mt-3 text-base font-black text-muted-900">No mapped hostel locations yet.</p>
                <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-600">
                  Add latitude and longitude to hostel blocks in HMS to show GPS locations here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function LocationFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="premium-card rounded-ui p-3">
      <div className="flex items-center gap-2 text-brand-700">
        {icon}
        <span className="text-xs font-black text-muted-900">{label}</span>
      </div>
      <p className="mt-1.5 text-2xl font-black text-muted-900">{value}</p>
    </div>
  );
}

function roomImage(room: AvailableRoom): string | null {
  return attachmentUrl(room.room_attachment) || attachmentUrl(room.block_attachment);
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

type PublicStats = {
  availableRooms: number;
  vacantBeds: number;
  publishedMealMenus: number;
  mappedHostels: number;
};

function getPublicStats(
  rooms: AvailableRoom[],
  locations: PublicLocation[],
  menus: PublicMealMenu[],
): PublicStats {
  return {
    availableRooms: rooms.length,
    vacantBeds: rooms.reduce((total, room) => total + room.vacant_beds, 0),
    publishedMealMenus: menus.filter((menu) => Boolean(menu.menu)).length,
    mappedHostels: locations.filter(
      (location) =>
        Number.isFinite(location.latitude) &&
        Number.isFinite(location.longitude),
    ).length,
  };
}
