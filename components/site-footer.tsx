import { Building2, Mail, MapPin } from "lucide-react";
import { contactUrl } from "@/lib/site-config";

const footerLinks = [
  ["Rooms", "#available-rooms"],
  ["Meals", "#meals"],
  ["Facilities", "#facilities"],
  ["Location", "#location"],
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/70 bg-white">
      <div className="container-grid grid gap-8 py-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 text-white">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black text-muted-900">HMS Hostel Booking</p>
              <p className="text-xs text-muted-500">A calm way to find student hostel rooms.</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-600">
            Browse rooms, published meals, and mapped hostel blocks before sending an inquiry to
            the hostel team.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-muted-900">Quick links</p>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-muted-600">
            {footerLinks.map(([label, href]) => (
              <a key={href} href={href} className="hover:text-brand-700">
                {label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-muted-900">Contact</p>
          <div className="mt-3 grid gap-3 text-sm font-semibold text-muted-600">
            <a href={contactUrl} className="flex items-center gap-2 hover:text-brand-700">
              <Mail className="h-4 w-4" />
              Hostel inquiry support
            </a>
            <a href="#location" className="flex items-center gap-2 hover:text-brand-700">
              <MapPin className="h-4 w-4" />
              View GPS location
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-grid flex flex-col gap-2 py-4 text-xs font-semibold text-muted-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} HMS. All rights reserved.</p>
          <p>Built for student hostel discovery.</p>
        </div>
      </div>
    </footer>
  );
}
