import {
  Building2,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import type { ReactNode } from "react";
import { BookingSection } from "@/components/booking-section";
import { Button } from "@/components/button";
import { LocationMapDialog } from "@/components/location-map-dialog";
import { SiteHeader } from "@/components/site-header";
import { fetchAvailableRooms, fetchPublicLocations, type AvailableRoom, type PublicLocation } from "@/lib/booking";
import { appUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [availableRooms, publicLocations] = await Promise.all([
    fetchAvailableRooms(),
    fetchPublicLocations(),
  ]);

  return (
    <main id="top" className="min-h-[100svh] bg-surface-page text-muted-900">
      <SiteHeader />
      <Hero availableRooms={availableRooms} publicLocations={publicLocations} />
    </main>
  );
}

function Hero({
  availableRooms,
  publicLocations,
}: {
  availableRooms: AvailableRoom[];
  publicLocations: PublicLocation[];
}) {
  return (
    <section className="flex min-h-[calc(100svh-3.5rem)] items-center bg-surface-page">
      <div className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-[minmax(0,0.86fr)_minmax(430px,1.14fr)] lg:gap-7 lg:px-8">
        <div className="min-w-0">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-brand-700 shadow-sm sm:text-sm">
            <Building2 className="h-4 w-4" />
            Hostel operations, clearly connected
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-600 sm:text-base lg:text-lg lg:leading-7">
            Manage students, rooms, payments, staff, notices, complaints, inquiries, and reports
            from one clean workspace built for daily hostel work.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
            <FeatureChip icon={<Users className="h-4 w-4" />} label="Students & rooms" />
            <FeatureChip icon={<WalletCards className="h-4 w-4" />} label="Payments & dues" />
            <FeatureChip icon={<ShieldCheck className="h-4 w-4" />} label="Roles & reports" />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href={appUrl}>Open HMS</Button>
            <LocationMapDialog locations={publicLocations} />
          </div>
          <MobileSummary availableCount={availableRooms.length} />
        </div>
        <div id="available-rooms" className="hidden min-h-0 scroll-mt-20 lg:block">
          <BookingSection rooms={availableRooms} variant="compact" />
        </div>
      </div>
    </section>
  );
}

function MobileSummary({ availableCount }: { availableCount: number }) {
  return (
    <div className="mt-6 grid grid-cols-3 gap-2 lg:hidden">
      <SmallSignal label="Students" value="126" />
      <SmallSignal label="Dues" value="18" tone="warning" />
      <SmallSignal label="Rooms" value={String(availableCount)} tone="success" />
    </div>
  );
}

function SmallSignal({
  label,
  value,
  tone = "brand",
}: {
  label: string;
  value: string;
  tone?: "brand" | "success" | "warning";
}) {
  const toneClasses = {
    brand: "text-brand-700",
    success: "text-emerald-700",
    warning: "text-amber-700",
  };

  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-sm">
      <p className={`text-lg font-bold leading-none ${toneClasses[tone]}`}>{value}</p>
      <p className="mt-1 truncate text-xs font-semibold text-muted-600">{label}</p>
    </div>
  );
}

function FeatureChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-muted-700 shadow-sm">
      <span className="text-brand-700">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
