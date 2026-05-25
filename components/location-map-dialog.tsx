"use client";

import { MapPin, X } from "lucide-react";
import { useState } from "react";
import { PublicLocationMap } from "@/components/public-location-map";
import type { PublicLocation } from "@/lib/booking";

type LocationMapDialogProps = {
  locations: PublicLocation[];
};

export function LocationMapDialog({ locations }: LocationMapDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-muted-800 shadow-sm transition hover:border-border-strong hover:bg-surface-subtle"
      >
        <MapPin className="h-4 w-4 text-brand-700" />
        <span>Get Map</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-end bg-muted-900/45 px-3 py-3 backdrop-blur-sm sm:items-center sm:justify-center sm:px-5">
          <div className="flex max-h-[92svh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-soft">
            <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-normal text-brand-700">
                  Hostel locations
                </p>
                <h2 className="mt-1 text-lg font-bold text-muted-900">Mapped blocks</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-600 transition hover:bg-muted-100"
                aria-label="Close map"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {locations.length > 0 ? (
              <div className="h-[70svh] min-h-[420px]">
                <PublicLocationMap locations={locations} />
              </div>
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center bg-surface-subtle px-6 text-center">
                <MapPin className="h-10 w-10 text-muted-400" />
                <p className="mt-3 text-base font-bold text-muted-900">
                  No mapped hostel locations yet.
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-600">
                  Add latitude and longitude to blocks in HMS to show them here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
