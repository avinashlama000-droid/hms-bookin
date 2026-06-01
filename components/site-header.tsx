"use client";

import { BedDouble, Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

const navItems = [
  ["Rooms", "#available-rooms"],
  ["Meals", "#meals"],
  ["Facilities", "#facilities"],
  ["Location", "#location"],
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/92 shadow-crisp backdrop-blur-xl">
      <div className="container-grid flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white shadow-crisp">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-black tracking-tight text-brand-800">
              HMS Hostel Booking
            </span>
            <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-muted-500 sm:block">
              Rooms, meals, and location
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-brand-100 bg-white p-1 shadow-crisp lg:flex" aria-label="Primary navigation">
          {navItems.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-4 py-2.5 text-sm font-bold text-muted-700 transition hover:bg-brand-50 hover:text-brand-800"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button
            href="#available-rooms"
            className="shrink-0 border-blue-600 bg-blue-600 shadow-crisp hover:bg-blue-700 hover:brightness-100"
            icon={<BedDouble className="h-4 w-4" />}
          >
            Book room
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-10 w-10 place-items-center rounded-ui border border-brand-100 bg-white text-muted-800 shadow-crisp lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-brand-100 bg-white shadow-deep lg:hidden">
          <div className="container-grid grid gap-2 py-4">
            {navItems.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-ui px-3 py-3 text-sm font-bold text-muted-700 hover:bg-brand-50"
              >
                {label}
              </a>
            ))}
            <a
              href="#available-rooms"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-ui bg-blue-600 px-3 py-3 text-center text-sm font-black text-white shadow-crisp hover:bg-blue-700"
            >
              Book room
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
