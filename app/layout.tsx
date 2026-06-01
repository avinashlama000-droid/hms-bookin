import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HMS Hostel Booking",
  description:
    "Find student hostel rooms, meal menus, and GPS locations from one calm booking website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
