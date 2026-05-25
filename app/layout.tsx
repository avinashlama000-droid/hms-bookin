import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HMS Hostel Management",
  description:
    "A clear hostel management website for understanding HMS operations, records, and access.",
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
