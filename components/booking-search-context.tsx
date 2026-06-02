"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

export type BookingDateMode = "dates" | "flexible";
export type FlexibleStay = "Weekend" | "Week" | "Month";

export type BookingGuestCounts = {
  adults: number;
  children: number;
  infants: number;
  pets: number;
};

export type BookingSearchIntent = {
  destinationLabel: string;
  destinationSearch: string;
  tenantSlug: string;
  dateMode: BookingDateMode;
  checkInDate: string;
  checkOutDate: string;
  flexibleStay: FlexibleStay;
  flexibleMonth: string;
  guests: BookingGuestCounts;
};

type BookingSearchContextValue = {
  intent: BookingSearchIntent;
  appliedVersion: number;
  applyIntent: (intent: BookingSearchIntent) => void;
};

const initialIntent: BookingSearchIntent = {
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

const BookingSearchContext = createContext<BookingSearchContextValue | null>(null);

export function BookingSearchProvider({ children }: { children: ReactNode }) {
  const [intent, setIntent] = useState(initialIntent);
  const [appliedVersion, setAppliedVersion] = useState(0);

  const value = useMemo<BookingSearchContextValue>(
    () => ({
      intent,
      appliedVersion,
      applyIntent: (nextIntent) => {
        setIntent(nextIntent);
        setAppliedVersion((current) => current + 1);
      },
    }),
    [intent, appliedVersion],
  );

  return (
    <BookingSearchContext.Provider value={value}>
      {children}
    </BookingSearchContext.Provider>
  );
}

export function useBookingSearch() {
  return useContext(BookingSearchContext);
}
