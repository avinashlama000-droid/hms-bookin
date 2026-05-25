import { Building2 } from "lucide-react";
import { appUrl } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-muted-900">HMS Hostel Management</p>
            <p className="text-xs text-muted-500">Operational clarity for hostel management.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-muted-600">
          <a href={appUrl} className="hover:text-brand-700">
            App
          </a>
        </div>
      </div>
    </footer>
  );
}
